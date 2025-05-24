#!/usr/bin/env python3
import pandas as pd
import joblib
from sklearn.base import TransformerMixin, BaseEstimator
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.neighbors import NearestNeighbors
import numpy as np

class TypeEncoder(TransformerMixin, BaseEstimator):
    def __init__(self):
        self.mlb = MultiLabelBinarizer()

    def fit(self, X, y=None):
        self.mlb.fit(X)
        return self

    def transform(self, X):
        return self.mlb.transform(X)

    def get_feature_names_out(self, input_features=None):
        return list(self.mlb.classes_)

def recommend(team_names, df, pipeline, metadata, k=5):
    # Recompute types_list for this DataFrame
    df = df.copy()
    df['types_list'] = df['types'].str.split('|')
    # Filter out excluded forms
    filtered = df[~df['name'].str.contains(metadata['exclude_regex'], regex=True)]
    # Find indices of the current team
    idxs = filtered[filtered['name'].isin(team_names)].index
    # Transform features
    feats = pipeline.named_steps['preprocessor'].transform(filtered)
    # Compute centroid
    centroid = feats[idxs].mean(axis=0).reshape(1, -1)
    # Find neighbors
    dists, idxs_nn = pipeline.named_steps['nn'].kneighbors(
        centroid, n_neighbors=max(k + len(team_names), pipeline.named_steps['nn'].n_neighbors)
    )
    all_names = metadata['pokemon_names']
    recommendations = [all_names[i] for i in idxs_nn[0] if all_names[i] not in team_names]
    return recommendations[:k]

def main():
    df = pd.read_csv('pokemon_full_dataset.csv')
    exclude_forms = r"mega|primal|gmax|crowned|eternamax"
    df = df[~df['name'].str.contains(exclude_forms, case=False, regex=True)].reset_index(drop=True)
    df['types_list'] = df['types'].str.split('|')
    numeric_cols = [
        'height', 'weight', 'base_experience',
        'hp', 'attack', 'defense',
        'special-attack', 'special-defense', 'speed'
    ]
    preprocessor = ColumnTransformer([
        ('types',  TypeEncoder(),    'types_list'),
        ('stats',  StandardScaler(), numeric_cols),
    ], remainder='drop')
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('nn',           NearestNeighbors(n_neighbors=20, algorithm='auto')),
    ])
    pipeline.fit(df)
    metadata = {
        'pokemon_names': df['name'].tolist(),
        'numeric_cols':   numeric_cols,
        'type_classes':   pipeline.named_steps['preprocessor']
                                    .named_transformers_['types']
                                    .mlb.classes_.tolist(),
        'exclude_regex':  exclude_forms
    }
    joblib.dump({'pipeline': pipeline, 'metadata': metadata}, 'poke_team_recommender.joblib')
    print("Saved trained pipeline to poke_team_recommender.joblib")
    sample = ['pikachu', 'bulbasaur', 'charmander', 'squirtle', 'pidgey']
    recs = recommend(sample, pd.read_csv('pokemon_full_dataset.csv'), pipeline, metadata, k=5)
    print("Sample recommendations:", recs)

if __name__ == "__main__":
    main()
