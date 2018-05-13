const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token('data', function getData(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :data :status :res[content-length] - :response-time ms'))

const generateId = () => {
    return Math.floor(Math.random() * Math.floor(9000))
}

app.get('/', (req, res) => {
    res.send('<h1>Hello World!!</h1>')
})

app.get('/info', (req, res) => {
    Person
        .find({}, { __v: 0 })
        .then(persons => {
            let content = '<p>puhelinluettelossa on ' + persons.length + ' henkilön tiedot</p>' +
                    '<p>' + new Date() + '</p>'
            res.send(content)
        })
})

app.get('/api/persons', (req, res) => {
    Person
        .find({}, { __v: 0 })
        .then(persons => {
            res.json(persons.map(Person.format))
        })
})

app.get('/api/persons/:id', (req, res) => {
    Person
        .findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(Person.format(person))
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            console.log(error)
            res.status(400).send({ error: 'malformatted id' })
        })
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

    Person
        .find({ name: body.name })
        .then(result => {
            if (result.length > 0) {
                return res.status(400).json({ error: 'person already exists' })
            } else {
                if (error) {
                    return res.status(400).json({ error: errorText })
                }

                const person = new Person({
                    id: generateId(),
                    name: body.name,
                    number: body.number
                })

                person
                    .save()
                    .then(savedPerson => {
                        res.json(Person.format(savedPerson))
                    })
                    .catch (error => {
                        console.log(error)
                    })
            }
        })
})

app.delete('/api/persons/:id', (req, res) => {
    Person
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(() => {
            res.status(400).send({ error: 'malformatted id' })
        })
})

app.put('/api/persons/:id', (req, res) => {
    Person
        .findOneAndUpdate({ name: req.body.name }, { number: req.body.number }, { new: true })
        .then(() => {
            res.status(204).end()
        })
        .catch(() => {
            res.status(400).send({ error: 'malformatted id' })
        })


})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})