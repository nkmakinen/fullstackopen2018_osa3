const mongoose = require('mongoose')

const url = 'mongodb://fullstack:4120@ds117010.mlab.com:17010/puhelinluettelo'

mongoose.connect(url)

const Person = mongoose.model('Person', {
    name: String,
    number: String,
})

var args = process.argv.splice(process.execArgv.length + 2)
if (args.length === 0) {
    Person
        .find({})
        .then(result => {
            console.log('puhelinluettelo:')
            result.forEach(person => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
        })
    return
}

const person = new Person({
    name: args[0],
    number: args[1]
})

person
    .save()
    .then(result => {
        console.log(`lisätään henkilö ${result.name} numero ${result.number} luetteloon`)
        mongoose.connection.close()
    })