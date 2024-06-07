document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokemonContainer = document.getElementById('pokemonContainer');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    const typeFilter = document.getElementById('typeFilter');
    const applyFiltersButton = document.getElementById('applyFilters');

    let currentPage = 1;
    const limit = 10;
    let currentType = ''; // Variable to store the current type filter

    applyFiltersButton.addEventListener('click', () => {
        currentPage = 1; // Reset to first page
        currentType = typeFilter.value; // Store the selected type filter
        fetchFilteredPokemonList();
    });

    function fetchFilteredPokemonList() {
        const type = currentType;
        const offset = (currentPage - 1) * limit;
        let url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

        if (type) {
            url = `https://pokeapi.co/api/v2/type/${type}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (type) {
                    const promises = data.pokemon.slice(offset, offset + limit).map(poke => fetch(poke.pokemon.url).then(response => response.json()));
                    Promise.all(promises).then(pokemonList => {
                        displayPokemon(pokemonList);
                        pageInfo.textContent = `Filtered by ${capitalize(type)} Type - Page ${currentPage}`;
                    });
                } else {
                    const promises = data.results.map(pokemon => fetch(pokemon.url).then(response => response.json()));
                    Promise.all(promises).then(pokemonList => {
                        displayPokemon(pokemonList);
                        pageInfo.textContent = `Page ${currentPage}`;
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function loadPokemonTypes() {
        const url = 'https://pokeapi.co/api/v2/type';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.results.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = capitalize(type.name);
                    typeFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchPokemon(query);
        } else {
            fetchPokemonList();
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchFilteredPokemonList();
        }
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        fetchFilteredPokemonList();
    });

    function searchPokemon(query) {
        const url = `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Pokémon not found');
                }
                return response.json();
            })
            .then(data => {
                displayPokemon([data]);
                pageInfo.textContent = `Search Results`;
            })
            .catch(error => {
                console.error('Error:', error);
                pokemonContainer.innerHTML = '<p>Pokémon not found</p>';
            });
    }

    function fetchPokemonList() {
        const offset = (currentPage - 1) * limit;
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const promises = data.results.map(pokemon => fetch(pokemon.url).then(response => response.json()));
                Promise.all(promises).then(pokemonList => {
                    displayPokemon(pokemonList);
                    pageInfo.textContent = `Page ${currentPage}`;
                });
            })
            .catch(error => console.error('Error:', error));
    }

    

    function displayPokemon(pokemonList) {
        pokemonContainer.innerHTML = '';
        pokemonList.forEach(pokemon => {
            console.log(pokemon);

            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.innerHTML = `
                <div class="pokeBlock1">
                    <div class="pokeimg"><img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"></div>
                    <div class="pokeName"><h3>${capitalize(pokemon.name)}</h3></div>
                </div>

                <div class="pokeBlock">
                    <strong>Info</strong>
                    <hr>
                    <div class="pokeInfo"><strong>Type:</strong> ${pokemon.types.map(type => capitalize(type.type.name)).join(', ')}</div>
                    <div class="pokeInfo"><strong>Abilities:</strong> ${pokemon.abilities.map(ability => capitalize(ability.ability.name)).join(', ')}</div>
                    <div class="pokeInfo"><strong>Height:</strong> ${pokemon.height * 10} cm</div>
                </div>

                <div class="pokeBlock">
                    <strong>Stats</strong>
                    <hr>
                    <div class="pokeInfo"><strong>HP:</strong> ${pokemon.stats[0].base_stat}</div>
                    <div class="pokeInfo"><strong>Attack:</strong> ${pokemon.stats[1].base_stat}</div>
                    <div class="pokeInfo"><strong>Defense:</strong> ${pokemon.stats[2].base_stat}</div>
                </div>
                
            `;
            pokemonContainer.appendChild(pokemonCard);
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    loadPokemonTypes();
    fetchPokemonList();    
});
