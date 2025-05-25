// Final App.js with Create Deck button and Pokémon modal updates
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const ALL_TYPES = [
  "fire", "water", "grass", "bug", "poison", "electric", "normal", "flying",
  "ground", "psychic", "fighting", "rock", "ghost", "dragon", "ice", "dark", "steel", "fairy"
];

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const loader = useRef(null);
  const BATCH_SIZE = 50;

  const loadPokemonBatch = async () => {
    const newData = [];

    for (let id = nextId; id < nextId + BATCH_SIZE; id++) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();
        const type = data.types[0]?.type.name || 'unknown';

        newData.push({
          id: data.id,
          name: data.name,
          sprite: data.sprites.front_default,
          type,
          stats: data.stats.map(s => ({
            name: s.stat.name,
            value: s.base_stat
          }))
        });
      } catch (error) {
        console.error(`Failed to load Pokémon ID ${id}:`, error);
      }
    }

    setPokemons(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newData.filter(p => !existingIds.has(p.id));
      return [...prev, ...uniqueNew];
    });

    setNextId(prev => prev + BATCH_SIZE);
  };

  useEffect(() => {
    loadPokemonBatch();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadPokemonBatch();
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [nextId]);

  const filteredPokemons = pokemons.filter(p =>
    p.name &&
    p.type &&
    (filterType === "all" || p.type.toLowerCase() === filterType.toLowerCase()) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByType = filteredPokemons.reduce((acc, pokemon) => {
    const type = pokemon.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(pokemon);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <h1>Pokédex Royale</h1>

      <div className="controls">
        <div className="search-deck-wrapper">
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="deck-btn" onClick={() => alert('Navigate to Create Deck Page')}>
            Create Deck
          </button>
        </div>
        <div className="filters">
          <button onClick={() => setFilterType("all")} className={filterType === "all" ? "active" : ""}>All</button>
          {ALL_TYPES.map(type => (
            <button
              key={type}
              className={filterType === type ? "active" : ""}
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(groupedByType).map(([type, pokemons]) => (
        <div key={type}>
          <h2 className="section-title">{type.toUpperCase()}</h2>
          <div className="card-grid">
            {pokemons.map(p => (
              <div key={p.id} className={`card type-${p.type}`}>
                <h2>{p.name}</h2>
                <img src={p.sprite} alt={p.name} />
                <p className="type-label">{p.type}</p>
                <button className="stat-btn" onClick={() => setSelectedPokemon(p)}>
                  Show Stats
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div ref={loader} className="loading">
        Loading more Pokémon...
      </div>

      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="pokedex-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPokemon(null)}>✖</button>

            <div className="pokedex-header">
              <h2 className="modal-title">{selectedPokemon.name}</h2>
              <div className="led-bar">
                <div className="led blue"></div>
                <div className="led red"></div>
                <div className="led yellow"></div>
                <div className="led green"></div>
              </div>
            </div>

            <div className="pokedex-screen">
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name} />
            </div>

            <div className="pokedex-list">
              <p><strong>Type:</strong> {selectedPokemon.type}</p>
              {selectedPokemon.stats
                .filter(stat => stat.name.toLowerCase() !== 'hp')
                .map(stat => (
                  <p key={stat.name}><strong>{stat.name}:</strong> {stat.value}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
