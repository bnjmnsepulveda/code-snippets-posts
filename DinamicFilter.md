
# Filtro dinamico para listas simples

El otro dia tube que afrontar un codigo en el cual obtenia una lista desde una base de datos y tenia que ser mi fuente de datos para complementar otra, la verdad este enfoque es bastante complejo ya que agrega complejidad al tratar datos de distintas fuentes para terminar generanado un maldito consolidado en un .csv. Gracias pandas por existir y darnos los dataframes
recuerden padawanes siempre consoliden los datos si tienen diferentes fuentes

pero no podiamos re hacer un codigo que funcionaba perfecto y ademas soy mas flojo la mandibula de arriba

tendre que usar la lista y consultarla el problemita era que eran un monton de filtros simples distintas propiedades y variaba del caso. un profesor (Cohelo don redes)me dijo el mejor ingeniero es el mas flojo por que hace el trabajo 1 vez y chao, pero el mundo del software es bastante loco, le hare caso sere mas flojo y explicare el paso a paso 

dada la siguiente estructura de codigo de mi amado typescript

```javascript

interface Person {
    id: number;
    name: string;
    age: number;
    hobby: string;
    job: string;
    genre: 'male' | 'female'
}
// retrieved from api 
const persons: Person[] = service.findAll()

```
teniendo la lista el codigo anterior era este para ciertas caracteristicas del bastardo 

```javascript

const teenegers: Person[] = persons.filter(p => p.age <= 18 && p.job === null)
const veterans: Person[] = persons..filter(p => p.age > 60)
const crazyPeople: Person[] = persons..filter(p => p.job === 'sofware enginner' && p.hobby === 'gamer')

```

buenos los filtros eran enormes muchas veces monton de codigo y era un filtro que no lo hemos resuelto antes? claro que si si trabajas con arquitectura hexagonal o cualquier framework maduro como spring o .NET habras conocido el patron specification, bastante util para reutilizar las logicas de negocios y condiciones logranbdo incluso componer otras nuevas, pero specification era como matar una mosca con un tanque. a crear una alternativa mas economica en lineas de codigo 

## No usare clases y lo hare con programacion funcional

como oiste bien usare malditas funciones en vez de clases mis maestros de POO se revuelcan en sus tumbas, javascript al final sus clases son simples objetos siempre ha sido la verdad claro las hermosas clases son azucar sintactico para mejorar las capacidades del lenguaje pero que diablos usare fiunciones ademas queda entero nitido en React me hace mas sentido seguir su filosifia lo mezclamos con typescript tampoco soy tan extremista 


este es el filtro es la misma wea que person 
```javascript
 
export interface Filter {
    id: number;
    name: string;
    age: number;
    hobby: string;
    job: string;
}

```
me declaro un weon flojo hoy dia arreglemoslo
```javascript
 
export type Filter = Partial<Person>

```
### grande typescript CTM!!!
Partial transforma todas las propiedades en opcionales y si quieres solo algunas usa esta otra wea magica

```javascript
 
type FilterProps = Pick<Person, 'id' | 'name' | 'job'>
export type Filter = Partial<FilterProps>

```

 ya ahora compadre viene las condiciones este sera un objeto clave - valor donde la clave es de tipo string y el valor en una funcion de tipo Function
 ```javascript
 const conditions = {
    id: (filter: Filter, candidate: Person) => candidate.id === filter.id,
    name: (filter: Filter, candidate: Person) => candidate.name === filter.name,
    age: (filter: Filter, candidate: Person) => candidate.age === filter.age,
    hobby: (filter: Filter, candidate: Person) => candidate.hobby.includes(''),
    job: (filter: Filter, candidate: Person) => candidate.job === filter.job,
    isTeeneger: (filter: Filter, candidate: Person) => {
        if (filter.isTeeneger) {
            return candidate.age <= 18
        }
        return candidate.age > 18 
    },
}

```

con esto crearemos una funcion que identifique las condiciones full funcional la logica 
leemos las keys del objeto y despues pro cada elemento accedemos con esa key a la fucnion correspondiente del objeto condition por ultimo filtramos las condiciones distintas de undefine

 ```javascript
 function getConditions(conditions: any, filter: Filter) {
        return Object
            .keys(filter)
            .map(key => conditions[key])
            .filter(condition => condition)
}

```


Tiembla gandalf que ahora viene la magia 

dependiendo de mi funcion getConditions obtendre una lista de los filtros y condiciones que debo aplicar a la lista de personas
entonces usando la funcion de array filter por cada persona aplicare la funcion de array every javascript sobre la lista de selectedConditios y every() evalua que todos los objetos de una lista cumplan la condicion dada mediante su callback buena!!!  con esto filtare las personas dadas por el filtro

```javascript
function findFilter(filter: Filter): Person[] {
    const selectedConditions = getConditions(conditions, filter)
    return persons.filter(person => selectedConditions.every(condition => condition(filter, person)))       
}

```

ahora juntemos todo y terminemos este maldito post con el archivo createQueriablePersonList.ts

* tenemos el objeto conditions con las condiciones definidas 
* teenmos nuestras principales funciones getCondition() quien filtra las condiciones y la funcion findPersonByFilter() noten que estas fucniones son puras y no tienen sideeffects con lo cual podran ser testeadas facilmente 
* finalmente exportmos nuestra funcion createQueriablePersonList(personsList: Person[]) la cual actua como una factoria y crea nuestro utilidad 
```javascript

const conditions = {
    id: (filter: Filter, candidate: Person) => candidate.id === filter.id,
    name: (filter: Filter, candidate: Person) => candidate.name === filter.name,
    age: (filter: Filter, candidate: Person) => candidate.age === filter.age,
    hobby: (filter: Filter, candidate: Person) => candidate.hobby.includes(''),
    job: (filter: Filter, candidate: Person) => candidate.job === filter.job,
    isCrazy: (filter: Filter, candidate: Person) => candidate.hobby.includes('software enginner') && filter.isCrazy
}

function findPersonsByFilter(persons: Person[], filter: Filter): Person[] {
    const selectedConditios = getConditions(conditions, filter)
    return persons.filter(person => selectedConditios.every(condition => condition(filter, person)))       
}

function getConditions(conditions: any, filter: Filter): any[] {
        return Object
            .keys(filter)
            .map(key => conditions[key])
            .filter(condition => condition)
}

export function createQueriablePersonList(personsList: Person[]) {
    // a inmutable object is created
    const persons = [
        ...personsList
    ]

    function findByFilter(filter: Filter) {
        return findPersonsByFilter(persons, filter)
    }
    
    return {
        findByFilter
    }
}

```

## usando nuestro hermosa funcion

```javascript

const persons: Person[] = service.findAll()
const searcheablePersons = createQueriablePersonList(persons)

const crazyPeople = searcheablePersons.findByFilter({
    name: 'benjamin',
    isCrazy: true
})

const gamers = searcheablePersons.findByFilter({
    hobby: ['games', 'rpg']
})

// puedes destructurar la funcion si lo deseas
const { findByFilter } =  createQueriablePersonList(persons)
```

## conclusion

crear un filtro dinamico puede ser sencillo facil y bonito a una lista si le dedicamos algo de tiempo a esta logica podriamso hacerlo con alguna api o consulta a base de datos pero sera para otro post.
 finalmente podriamos reutilizar esta logica con Generics tanto den funcional como en POO pero recomendaria hacerlo con una estructura de clase que para patrones de diseño es bastante poderoso 
