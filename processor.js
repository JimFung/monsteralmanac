const got = require('got')
const mongoose = require('mongoose')
const { EventEmitter } = require('events')

const MonsterSchema = require('./MonsterSchema')
const { dbAddr } = require('./settings')

const emitter = new EventEmitter()

mongoose.Promise = global.Promise
const db = mongoose.connect(dbAddr)
const monster = db.model('Monster', MonsterSchema)
let count

// Get the list of URLs to query
const getInitialList = () => got('http://dnd5eapi.co/api/monsters')
  .then(resp => {
    let body = JSON.parse(resp.body)
    count = body.count
    return body.results.map(elem => elem.url)
  })
  .catch(error => {
    console.log(error.response.body)
  })

// Query all the URLs, emit an event once the promise is fulfilled
const queryAll = list => list.forEach(url => getMonster(url))

const getMonster = url => {
  got(url)
    .then(resp => {
      data = JSON.parse(resp.body)
      delete data._id
      delete data.url
      emitter.emit('success', data)
    })
    .catch(error => {
      emitter.emit('failure', error)
    })
}

const importToDB = data => {
  let entry = new monster(data)
  entry.save(err => {
    if (err) {
      emitter.emit('failure', err)
    } else {
      count--
      console.log(`${data.name} saved to db. ${count} items still remaining.`)
      if (count === 0) {
        db.disconnect()
        console.log('Finished Upload.\nDisconnting from db.')
      }
    }
  })
}

emitter.on('success', importToDB)
emitter.on('failure', error => console.log(error))

//Get the ball rolling
getInitialList().then(queryAll)
