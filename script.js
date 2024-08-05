const POKEMON_ID = 6

const POKEMON_COLOR_TYPES = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

const $ = (id) => document.getElementById(id)

let index = 0
let globalMoves = []

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function parseStats(stats) {
    const statsKeys = {
        'hp': {
            name: 'hp',
            displayName: 'HP'
        },
        'attack': {
            name: 'attack',
            displayName: 'Attack'
        },
        'defense': {
            name: 'defense',
            displayName: 'Defense'
        },
        'special-attack': {
            name: 'specialAttack',
            displayName: 'Special Attack'
        },
        'special-defense': {
            name: 'specialDefense',
            displayName: 'Special Defense'
        },
        'speed': {
            name: 'speed',
            displayName: 'Speed'
        }
    }

    const mappedStats = stats.map(({ base_stat, stat: { name } }) => ({
        name: statsKeys[name].name,
        displayName: statsKeys[name].displayName,
        baseStat: base_stat,
    }))

    return mappedStats
}

async function getTypeColor(url) {
    const response = await fetch(url)

    if (!response.ok) {
        return
    }

    const { type: { name } } = await response.json()

    return POKEMON_COLOR_TYPES[name]
}

function parseMoves(moves) {
    const mappedMoves = moves.map(({ move: { name, url } }) => ({
        name,
        displayName: name.toLowerCase().split('-').map(capitalize).join(' '),
        url
    }))

    return mappedMoves
}

function parseAbilities(abilities) {
    const mappedAbilities = abilities.map(({ ability: { name } }) => ({
        name,
        displayName: name.toLowerCase().split('-').map(capitalize).join(' '),
    }))

    return mappedAbilities
}

async function getPokeData() {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${POKEMON_ID}?limit=50`)

    if (!response.ok) {
        alert('Something went wrong!')
        return
    }

    const data = await response.json()

    const {
        name,
        sprites: { front_default },
        types,
        abilities,
        moves,
        stats,
    } = data

    return {
        name: capitalize(name),
        sprite: front_default,
        types,
        abilities: parseAbilities(abilities),
        moves: parseMoves(moves),
        stats: parseStats(stats)
    }
}

function setName(name) {
    $('pokemon-name').textContent = name
}

function setSprite(sprite) {
    $('pokemon-sprite').src = sprite
}

function setTypes(types) {
    const typesList = $('pokemon-types')

    types.forEach((type) => {
        const listItem = document.createElement('li')
        listItem.textContent = capitalize(type.type.name)
        typesList.appendChild(listItem)
    })
}

function setAbilities(abilities) {
    const abilitiesList = $('pokemon-abilities')

    abilities.forEach(({ displayName }) => {
        const listItem = document.createElement('li')
        listItem.textContent = displayName
        abilitiesList.appendChild(listItem)
    })
}

function setMoves(moves) {
    const movesList = $('pokemon-moves')

    moves.forEach(({ displayName, color }) => {
        const listItem = document.createElement('li')
        listItem.textContent = displayName
        listItem.style.backgroundColor = color
        movesList.appendChild(listItem)
    })
}

function setStats(stats) {
    const statsList = $('pokemon-stats')

    stats.forEach(({ displayName, baseStat }) => {
        const listItem = document.createElement('li')
        const statName = document.createElement('span')
        const statValue = document.createElement('span')

        listItem.classList.add('card')
        statName.classList.add('title')

        statName.textContent = displayName
        statValue.textContent = baseStat

        listItem.appendChild(statName)
        listItem.appendChild(statValue)

        statsList.appendChild(listItem)
    })
}

async function loadMovesColor(moves) {
    const loadedMoves = await Promise.all(moves.map(async (move) => {   
        const color = await getTypeColor(move.url)

        if (color) {
            return {
                ...move,
                color
            }
        }

        return {
            ...move,
            color: '#ffffff'
        }
    }))

    return loadedMoves
}

function setColorsReference() {
    Object.entries(POKEMON_COLOR_TYPES).forEach(([name, code]) => {
        const listItem = document.createElement('li')
        const colorCircle = document.createElement('span')
        const colorName = document.createElement('span')

        colorCircle.classList.add('color-circle')
        colorCircle.style.backgroundColor = code
        
        colorName.classList.add('color-name')
        colorName.textContent = capitalize(name)

        listItem.classList.add('color-container')

        listItem.appendChild(colorCircle)
        listItem.appendChild(colorName)

        $('colors-refence').appendChild(listItem)
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    const {
        name,
        sprite,
        types,
        abilities,
        moves,
        stats
    } = await getPokeData()

    globalMoves = moves

    const loadedMoves = await loadMovesColor(moves.slice(0, 10))

    index = loadedMoves.length

    setName(name)
    setSprite(sprite)
    setTypes(types)
    setAbilities(abilities)
    setMoves(loadedMoves)
    setStats(stats)
    setColorsReference()
})

$('pokemon-moves-more').addEventListener('click', async () => {
    const loadedMoves = await loadMovesColor(globalMoves.slice(index, index + 10))

    index += loadedMoves.length

    setMoves(loadedMoves)
})