// Deck.js - Clash Royale style Pokémon Deck Builder with popup confirmation
import React, { useState } from 'react';
import './deck.css';

function Deck({ pokemons = [] }) {
  const [deck, setDeck] = useState([]);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const addToDeck = (pokemon) => {
    if (deck.find(p => p.id === pokemon.id)) {
      setMessage("This Pokémon is already in your deck.");
      return;
    }
    if (deck.length >= 6) {
      setMessage("You can only have 6 Pokémon in your deck.");
      return;
    }
    setDeck([...deck, pokemon]);
    setMessage("");
  };

  const removeFromDeck = (id) => {
    setDeck(deck.filter(p => p.id !== id));
    setMessage("");
  };

  const play = () => {
    if (deck.length < 6) {
      setMessage("Select 6 Pokémon to start playing.");
    } else {
      setShowPopup(true);
    }
  };

  return (
    <div className="deck-page">
      <h1 className="deck-title">Create Your Pokémon Deck</h1>

      <div className="deck-container">
        {deck.map(p => (
          <div key={p.id} className="deck-card">
            <img src={p.sprite} alt={p.name} />
            <p>{p.name}</p>
            <button onClick={() => removeFromDeck(p.id)}>Remove</button>
          </div>
        ))}
      </div>

      <p className="deck-message">{message}</p>

      <button className="play-btn" onClick={play} disabled={deck.length !== 6}>
        Let's Play
      </button>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>You're all set, amigo! 🎮</h2>
            <p>Your deck is ready to go.</p>
            <button className="popup-close" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      <h2 className="available-title">Available Pokémon</h2>
      <div className="available-pokemon">
        {pokemons.map(p => (
          <div key={p.id} className="available-card">
            <img src={p.sprite} alt={p.name} />
            <p>{p.name}</p>
            <button onClick={() => addToDeck(p)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Deck;
