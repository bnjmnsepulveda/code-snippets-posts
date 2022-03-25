// model
interface Person {
    id: number;
    dni: string;
    name: string;
    age: number;
    hobbies: string[];
    job: string;
    genre: 'male' | 'female';
    catlover: boolean;
    doglover: boolean;
}
// props for filter
type FilterProps = Pick<Person, 'id' | 'name' | 'job' |'age' | 'genre' >
// definig all properties as optional
type FilterBase = Partial<FilterProps>
// adding new filters
interface Filter extends FilterBase {
    isCrazy?: boolean;
    withHobby?: string;
}
// condition type
type Condition = (filter: Filter, candidate: Person) => boolean | undefined
// Conditions
interface Conditions {
    id: Condition;
    name: Condition;
    job: Condition;
    age: Condition;
    genre: Condition;
    isCrazy: Condition;
    withHobby: Condition;
}


function findAll(): Person[] {
    return [
        {
            id: 1,
            name: 'benjamin',
            age: 23,
            catlover: true,
            dni: '1-7',
            doglover: true,
            genre: 'male',
            hobbies: ['games', 'beers'],
            job: 'software engineer'
        },
        {
            id: 2,
            name: 'faby',
            age: 23,
            catlover: true,
            dni: '1-6',
            doglover: true,
            genre: 'female',
            hobbies: ['cooking', 'shopping', 'games'],
            job: 'doctor'
        },
        {
            id: 3,
            name: 'jack',
            age: 34,
            catlover: false,
            dni: '1-8',
            doglover: true,
            genre: 'male',
            hobbies: ['sports', 'cooking', 'games'],
            job: 'lawyer'
        },
        {
            id: 3,
            name: 'arnold',
            age: 50,
            catlover: false,
            dni: '1-9',
            doglover: true,
            genre: 'male',
            hobbies: ['sports', 'back to past', 'army'],
            job: 'lawyer'
        }
    ]
}


const conditions = {
    id: (filter: Filter, candidate: Person) => candidate.id === filter.id,
    name: (filter: Filter, candidate: Person) => candidate.name === filter.name,
    age: (filter: Filter, candidate: Person) => candidate.age === filter.age,
    genre: (filter: Filter, candidate: Person) => candidate.genre === filter.genre,
    job: (filter: Filter, candidate: Person) => candidate.job === filter.job,
    isCrazy: (filter: Filter, candidate: Person) => filter.isCrazy ? candidate.job === 'software engineer' : candidate.job !== 'software engineer',
    withHobby: (filter: Filter, candidate: Person) => filter.withHobby ? candidate.hobbies.includes(filter.withHobby) : false
}

function findPersonsByConditions(persons: Person[], filter: Filter, conditions: any[]): Person[] {
    return persons.filter(person => conditions.every(condition => condition(filter, person)))       
}

function getConditions(conditions: any, filter: Filter): any[] {
        return Object
            .keys(filter)
            .map(key => conditions[key])
            .filter(condition => condition)
}

export function createQueriablePersonList(personsList: Person[]) {

    const persons = [
        ...personsList
    ]

    function findByFilter(filter: Filter) {
        const selectedConditions = getConditions(conditions, filter)
        return findPersonsByConditions(persons, filter, selectedConditions)
    }
    
    return {
        findByFilter
    }
}




const persons: Person[] = findAll()
const searcheablePersons = createQueriablePersonList(persons)

const crazyPeople = searcheablePersons.findByFilter({
    isCrazy: true
})

const by23yearsOld = searcheablePersons.findByFilter({
    age :23
})

const gamers = searcheablePersons.findByFilter({
    withHobby: 'games'
})

const sportsAndLawyers = searcheablePersons.findByFilter({
    withHobby: 'sports',
    job: 'lawyer'
})





console.log('--- CRAZY Persons ---')
crazyPeople.forEach(p => console.log(p.name))

console.log('--- GAMES Persons ---')
gamers.forEach(p => console.log(p.name))

console.log('--- 23 years old ---')
by23yearsOld.forEach(p => console.log(p.name))

console.log('--- sports and lawyers ---')
sportsAndLawyers.forEach(p => console.log(p.name))
// puedes destructurar la funcion si lo deseas
const { findByFilter } =  createQueriablePersonList(persons)