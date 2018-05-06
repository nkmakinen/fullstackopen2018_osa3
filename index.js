const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token('data', function getData(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :data :status :res[content-length] - :response-time ms'))

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Martti Tienari',
        number: '01312312'
    },
    {
        id: 3,
        name: 'Arto Järvinen',
        number: '0401231233'
    },
    {
        id: 4,
        name: 'Lea Kutvonen',
        number: '355435121'
    }
]


const generateId = () => {
    return Math.floor(Math.random() * Math.floor(9000))
}

app.get('/', (req, res) => {
    res.send('<h1>Hello World!!</h1>')
})

app.get('/info', (req, res) => {
    let content = '<p>puhelinluettelossa on ' + persons.length + ' henkilön tiedot</p>' + 
                  '<p>' + new Date() + '</p>'

    res.send(content)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    let errorText
    let error = false

    if (body.name === undefined) {
        error = true
        errorText = 'name missing'
    }

    if (body.number === undefined) {
        error = true
        errorText = 'number missing'
    }

    let duplicate = persons.find(function(person) {
        return body.name === person.name
    })

    if (duplicate !== undefined) {
        error = true
        errorText = 'name must be unique'
    }

    if (error) {
        return res.status(400).json({ error: errorText })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})