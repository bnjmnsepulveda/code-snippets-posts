# Viernes de siluetas coderas

# Filtro dinámico para listas simples

El otro día tube que modificar un código en el cual obtenía una lista desde una API y tenia que ser mi fuente de datos para complementar otra, dependiendo del registro la verdad este enfoque es bastante complejo ya que agrega código spagetti 🍝  al tratar datos de distintas fuentes para terminar generando consolidado en un maldito  .CSV 🧾

 pero no podíamos re hacer un código que funcionaba perfecto y ademas soy mas flojo la mandíbula de arriba 

tendré que usar la lista y consultarla como en los otros módulos de la aplicación el problemita era que eran un montón de filtros simples muchas propiedades y dependiendo del caso era de 1 prop a N prop 😮‍💨. uno de mis profesores me dijo una vez que el mejor ingeniero es el mas flojo 😅por que hace el trabajo 1 vez y chao 😝, pero el mundo del software es bastante loco y diverso en soluciones no siempre el reciclado de código funciona tengan esto en cuenta cuando modelen su maldito **dominio**. pero esta vez le hare caso me dare la libertad de la flojera y explicare el paso a paso de una solución lo mas optima posible.

## La estructura del modelo y la solución

Dado el siguiente modelo codificado con mi amado typescript ❤️

```tsx
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
// retrieved from api
const persons: Person[] = findAll()
```

tenemos que realizar filtros como estos y otros mas...

```tsx
const teenegers: Person[] = persons.filter(p => p.age <= 18 && p.job === null);
const veterans: Person[] = persons..filter(p => p.age > 60);
const crazyPeople: Person[] = persons..filter(p => p.job === 'sofware enginner' && p.hobby === 'gamer');
```

Habían filtros que eran enormes muchas veces montón de código y estas weas de filtros reutilizables no se ha resuelto antes? 🤔  por supuesto que sí muchachos!!! si has trabajado con arquitectura hexagonal o cualquier framework maduro como spring o .NET posiblemente salío en la conversa el patron **specification**, bastante util para reutilizar las lógicas de negocios y condiciones logrando incluso componer otras nuevas 😱 con AND , OR o NOT, impresionante patron de diseño. Pero specification era como matar una mosca con un tanque. a crear una alternativa mas económica de lineas de código.

## No usare clases 😱 y lo hare con programación funcional 😮

como escuchaste usare malditas funciones en vez de clases. mis maestros de POO se revolcaran  en sus tumbas.  javascript al final cuando creas una clase en realidad son simples objetos siempre ha sido la verdad claro las hermosa palabra **class** es azúcar sintáctico para mejorar las capacidades del lenguaje pero que diablos usare funciones como los vieja escuela de programación ademas va a quedar entero nítido en React me hace mas sentido seguir su filosofía y le agregamos  500g de typescript tampoco nos vallamos al extremo.

La siguiente interfaz representará el filtro, pero si se dan cuenta es la misma wea que el modelo 😤 

```tsx
export interface Filter {    
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
```

Flojera ven a mí !!! **grande typescript CTM!!!**

Partial transforma todas las propiedades en opcionales. 

```tsx
export type Filter = Partial<Person>
```

Si quieres solo algunas propiedades usa esta otra wea mágica 😎  Pick<T, K extends keyof T>

con el Pick puedes crear un nuevo tipo en typescript con las propiedades que solo necesitas

```tsx

type FilterProps = Pick<Person, 'id' | 'name' | 'job' |'age' | 'genre' >

type FilterBase = Partial<FilterProps>

```

Ahora este type sera nuestro filtro base y extenderemos una interfaz para crear filtros adicionales

```tsx

interface Filter extends FilterBase {
    isCrazy?: boolean;
    withHobby?: string;
}
```

ya ahora compadre viene las condiciones este sera un objeto clave - valor donde la clave es de tipo string y el valor en una función de tipo Function. recuerda que las keys de este objeto deben coincidir con las propiedades definidas en nuestro filtro

```tsx
const conditions = {
    id: (filter: Filter, candidate: Person) => candidate.id === filter.id,
    name: (filter: Filter, candidate: Person) => candidate.name === filter.name,
    age: (filter: Filter, candidate: Person) => candidate.age === filter.age,
    genre: (filter: Filter, candidate: Person) => candidate.genre === filter.genre,
    job: (filter: Filter, candidate: Person) => candidate.job === filter.job,
    isCrazy: (filter: Filter, candidate: Person) => filter.isCrazy ? candidate.job === 'software engineer' : candidate.job !== 'software engineer',
    withHobby: (filter: Filter, candidate: Person) => filter.withHobby ? candidate.hobbies.includes(filter.withHobby) : false
}
```

Ahora creamos una función que identifique las condiciones, la lógica es simple leemos las keys del objeto y después por cada elemento accedemos con esa key a la función correspondiente del objeto condition por ultimo filtramos las condiciones distintas de undefined

```tsx
function getConditions(conditions: any, filter: Filter): any[] {
        return Object
            .keys(filter)
            .map(key => conditions[key])
            .filter(condition => condition)
}
```

### Tiembla Gandalf el gris que ahora viene mas magia

dependiendo de mi función getConditions() obtendré una lista de los filtros y condiciones que debo aplicar a la lista de personas entonces usando la función de array filter por cada persona aplicare la función de array every() sobre la lista de selectedConditions la función every() evalúa que todos los objetos de una lista cumplan la condición dada mediante una función callback **buena!!!** 😏 **** con esto filtraré las personas dadas por el filtro

```tsx
function findPersonsByFilter(persons: Person[], filter: Filter): Person[] {
    const selectedConditions = getConditions(conditions, filter)
    return persons.filter(person => selectedConditions.every(condition => condition(filter, person)))       
}
```

ahora juntemos todo y terminemos este maldito post con el archivo createQueriablePersonList.ts

- tenemos el objeto conditions con las condiciones definidas
- tenemos nuestras principales funciones getCondition() quien filtra las condiciones y la función findPersonByFilter() atentos que estas funciones son puras y no tienen side effects con lo cual podrán crear sus test unitarios fácilmente **(FUCK!! to mocking objects)**
- finalmente exportamos nuestra función createQueriablePersonList(personsList: Person[]) la cual es una factoría y crea nuestra utilidad

```tsx
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
```

## Usando nuestra hermosa función

```tsx
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
            age: 20,
            catlover: false,
            dni: '1-6',
            doglover: true,
            genre: 'male',
            hobbies: ['sports', 'cooking', 'games'],
            job: 'lawyer'
        }
    ]
}

const persons: Person[] = findAll()
const searcheablePersons = createQueriablePersonList(persons)

const crazyPeople = searcheablePersons.findByFilter({
    isCrazy: true
})

const gamers = searcheablePersons.findByFilter({
    withHobby: 'games'
})

const by23yearsOld = searcheablePersons.findByFilter({
    age :23
})

console.log('--- CRAZY Persons ---')
crazyPeople.forEach(p => console.log(p.name))

console.log('--- GAMES Persons ---')
gamers.forEach(p => console.log(p.name))

console.log('--- 23 years old ---')
by23yearsOld.forEach(p => console.log(p.name))

// puedes destructurar la funcion si lo deseas
const { findByFilter } =  createQueriablePersonList(persons)
```

La parte importante del filtrado dinámico es el siguiente código en donde nuestro filtro tiene las propiedades opcionales dadas por el la interface Filter

```tsx
const craziestPersons = searcheablePersons.findByFilter({
    isCrazy: true,
		job: 'Witi programmer',
		withHobby: 'gamer'
})
```

## Hemos terminado muchachos!!!

 Crear un filtro dinámico puede ser sencillo, fácil y bonito. esta vez lo hicimos con un humilde Array si le dedicamos algo de tiempo a esta lógica podríamos hacerlo con alguna API o algún crud de base de datos si hablamos del backend. pero sera para otro día. finalmente esta lógica puede ser reutilizada con Generics tanto en funcional como en Programación Orientada a Objetos pero recomiendo hacerlo con una estructura de clases será mas flexible 😎