document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokemonContainer = document.getElementById('pokemonContainer');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const resetFilters = document.getElementById('resetFilters');

    const typeFilter = document.getElementById('typeFilter');
    const abilitiesFilter = document.getElementById('abilityFilter');
    const heightFilter = document.getElementById('heightFilter');
    const hpFilter = document.getElementById('hpFilter');
    const attackFilter = document.getElementById('attackFilter');
    const defenseFilter = document.getElementById('defenseFilter');
    const applyFiltersButton = document.getElementById('applyFilters');


    let currentPage = 1;


    let currentType = ''; // Variable to store the current type filter
    let currentAbility = ''
    minHeight = 0;
    minHp = 0;
    minAttack = 0;
    minDefense = 0;


    const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=2000';
    let allPokemon = [];
    let filteredPokemon = [];
    currentPage = 1;
    let totalPages = 0;
    const itemsPerPage = 10;

    function showProgressBar() {
        // Crear la barra de progreso
        const progressBar = document.createElement('progress');
        progressBar.setAttribute('max', 100); // Establecer el valor máximo de la barra (100%)
        progressBar.style.width = '100%'; // Establecer el ancho completo para que sea visible
        document.body.appendChild(progressBar); // Añadir la barra de progreso al cuerpo del documento
    }
    
    function updateProgressBar(value) {
        // Actualizar el valor de la barra de progreso
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = value;
        }
    }
    
    function hideProgressBar() {
        // Ocultar y eliminar la barra de progreso
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.remove();
        }
    }
    
    function fetchFilteredPokemonList() {
        showProgressBar(); // Mostrar la barra de progreso antes de iniciar la carga de datos
    
        let url = apiUrl;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const totalRequests = data.results.length;
                let completedRequests = 0;
    
                const promises = data.results.map(pokemon => {
                    return fetch(pokemon.url)
                        .then(response => response.json())
                        .then(pokemonData => {
                            allPokemon.push(pokemonData);
                            filteredPokemon.push(pokemonData);
                            completedRequests++;
                            const progress = Math.floor((completedRequests / totalRequests) * 100);
                            updateProgressBar(progress); // Actualizar la barra de progreso
                        });
                });
    
                Promise.all(promises).then(() => {
                    totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
                    displayPage(currentPage);
                    hideProgressBar(); // Ocultar la barra de progreso una vez que se completó la carga
                });
    
            })
            .catch(error => {
                console.error('Error:', error);
                hideProgressBar(); // En caso de error, asegúrate de ocultar la barra de progreso
            });
    }

    function applyFilter(pokemonList) {
        return pokemonList.filter(pokemon => {
            let typeMatches = true;
            let abilityMatches = true;
            let heightMatches = true;
            let hpMatches = true;
            let attackMatches = true;
            let defenseMatches = true;

            if (currentType) {
                typeMatches = pokemon.types.some(type => type.type.name === currentType);
            }

            if (currentAbility) {
                abilityMatches = pokemon.abilities.some(ability => ability.ability.name === currentAbility);
            }

            if (minHeight) {
                heightMatches = pokemon.height * 10 >= minHeight; // Assuming height is in decimetres
            }

            if (minHp) {
                hpMatches = pokemon.stats[0].base_stat >= minHp; // Assuming HP is the first stat
            }

            if (minAttack) {
                attackMatches = pokemon.stats[1].base_stat >= minAttack; // Assuming Attack is the second stat
            }

            if (minDefense) {
                defenseMatches = pokemon.stats[2].base_stat >= minDefense; // Assuming Defense is the third stat
            }

            return typeMatches && abilityMatches && heightMatches && hpMatches && attackMatches && defenseMatches;
        });
    }

    function displayPage(page) {
        pokemonContainer.innerHTML = '';
        pageInfo.textContent = `Page ${currentPage}`;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPokemon = filteredPokemon.slice(startIndex, endIndex);

        paginatedPokemon.forEach(pokemon => {
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
                    <table>
                        <tr>
                            <td><strong>Type:</strong></td>
                            <td>${pokemon.types.map(type => capitalize(type.type.name)).join(', ')}</td>
                        </tr>
                        <tr>
                            <td><strong>Abilities:</strong></td>
                            <td>${pokemon.abilities.map(ability => capitalize(ability.ability.name)).join(', ')}</td>
                        </tr>
                        <tr>
                            <td><strong>Height:</strong></td>
                            <td>${pokemon.height * 10} cm</td>
                        </tr>
                    </table>
                </div>

                <div class="pokeBlock">
                    <strong>Stats</strong>
                    <hr>
                    <table>
                        <tr>
                            <td><strong>HP:</strong></td>
                            <td>${pokemon.stats[0].base_stat}</td>
                        </tr>
                        <tr>
                            <td><strong>Attack:</strong></td>
                            <td>${pokemon.stats[1].base_stat}</td>
                        </tr>
                        <tr>
                            <td><strong>Defense:</strong></td>
                            <td>${pokemon.stats[2].base_stat}</td>
                        </tr>
                    </table>
                </div>
            `;
            pokemonContainer.appendChild(pokemonCard);
        });
    }



    function loadPokemonTypes() {
        const url = 'https://pokeapi.co/api/v2/type?limit=1000';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.results.sort((a, b) => a.name.localeCompare(b.name));
                data.results.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = capitalize(type.name);
                    typeFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function loadPokemonAbilities() {
        const url = 'https://pokeapi.co/api/v2/ability?limit=1000';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.results.sort((a, b) => a.name.localeCompare(b.name));
                data.results.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = capitalize(type.name);
                    abilitiesFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    resetFilters.addEventListener('click', () => {
        typeFilter.value = '';
        abilitiesFilter.value = '';
        heightFilter.value = '';
        hpFilter.value = '';
        attackFilter.value = '';
        defenseFilter.value = '';
        currentPage = 1;
        currentType = '';
        currentAbility = '';
        minHeight = 0;
        minHp = 0;
        minAttack = 0;
        minDefense = 0;
        filteredPokemon = allPokemon;
        totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
        displayPage(currentPage);
    });

    applyFiltersButton.addEventListener('click', () => {
        currentPage = 1; // Reset to first page
        currentType = typeFilter.value; // Store the selected type filter
        currentAbility = abilitiesFilter.value; // Store the selected ability filter
        minHeight = heightFilter.value;
        minHp = hpFilter.value;
        minAttack = attackFilter.value;
        minDefense = defenseFilter.value;

        filteredPokemon = applyFilter(allPokemon);
        totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
        displayPage(currentPage);

    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        totalPages = 1;
        if (query) {
            searchPokemon(query);
        } else {
            fetchPokemonList();
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
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
                    <table>
                        <tr>
                            <td><strong>Type:</strong></td>
                            <td>${pokemon.types.map(type => capitalize(type.type.name)).join(', ')}</td>
                        </tr>
                        <tr>
                            <td><strong>Abilities:</strong></td>
                            <td>${pokemon.abilities.map(ability => capitalize(ability.ability.name)).join(', ')}</td>
                        </tr>
                        <tr>
                            <td><strong>Height:</strong></td>
                            <td>${pokemon.height * 10} cm</td>
                        </tr>
                    </table>
                </div>

                <div class="pokeBlock">
                    <strong>Stats</strong>
                    <hr>
                    <table>
                        <tr>
                            <td><strong>HP:</strong></td>
                            <td>${pokemon.stats[0].base_stat}</td>
                        </tr>
                        <tr>
                            <td><strong>Attack:</strong></td>
                            <td>${pokemon.stats[1].base_stat}</td>
                        </tr>
                        <tr>
                            <td><strong>Defense:</strong></td>
                            <td>${pokemon.stats[2].base_stat}</td>
                        </tr>
                    </table>
                </div>
            `;
            pokemonContainer.appendChild(pokemonCard);
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    loadPokemonTypes();
    loadPokemonAbilities();
    fetchFilteredPokemonList();
});


