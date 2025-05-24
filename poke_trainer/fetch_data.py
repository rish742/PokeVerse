# fetch_pokemon_data.py

import asyncio
import aiohttp
import pandas as pd

API_BASE = "https://pokeapi.co/api/v2"

async def fetch_json(session, url):
    async with session.get(url) as resp:
        resp.raise_for_status()
        return await resp.json()

async def get_pokemon_list(session):
    # first find out how many there are
    info = await fetch_json(session, f"{API_BASE}/pokemon?limit=1")
    total = info["count"]
    # now fetch all names & urls
    data = await fetch_json(session, f"{API_BASE}/pokemon?limit={total}")
    return data["results"]  # list of { name, url }

async def get_pokemon_detail(session, entry):
    data = await fetch_json(session, entry["url"])
    return {
        "id":               data["id"],
        "name":             data["name"],
        "height":           data["height"],
        "weight":           data["weight"],
        "base_experience":  data["base_experience"],
        # flatten types, stats, abilities
        "types":            "|".join(t["type"]["name"] for t in data["types"]),
        **{stat["stat"]["name"]: stat["base_stat"] for stat in data["stats"]},
        "abilities":        "|".join(a["ability"]["name"] for a in data["abilities"]),
    }

async def main():
    async with aiohttp.ClientSession() as session:
        # 1) get list of all pokemon
        pokelist = await get_pokemon_list(session)

        # 2) fetch details in parallel
        tasks = [get_pokemon_detail(session, p) for p in pokelist]
        all_data = await asyncio.gather(*tasks)

        # 3) build DataFrame and save
        df = pd.DataFrame(all_data).sort_values("id")
        df.to_csv("pokemon_full_dataset.csv", index=False)
        print("Saved", len(df), "rows to pokemon_full_dataset.csv")

if __name__ == "__main__":
    asyncio.run(main())
