var test = require('tap').test
var InfluxDbLineProto = require('../')

test('should save mesurement and value', function (t) {
  var influxDbLineProto = new InfluxDbLineProto('127.0.0.1', '8092')
  influxDbLineProto.on('error', function demo(err) {
    throw new Error(err)
  })

  influxDbLineProto.send('test', {
    value : 12
  })

  setTimeout(function () {
    t.end()
  }, 1200)
})

test('should save document with tags and timestamps', function (t) {
  var influxDbLineProto = new InfluxDbLineProto('127.0.0.1', '8092')

  influxDbLineProto.on('error', function (err) {
    throw new Error(err)
  })

  influxDbLineProto.send('test', {
    value : 12
  }, {
    src : 'unit'
  }, new Date().getTime())

  setTimeout(function () {
    t.end()
  }, 200)
})

test('should emit error when mesurement is not string', function (t) {
  var influxDbLineProto = new InfluxDbLineProto('127.0.0.1', '8092')
  var ifError = false
  influxDbLineProto.on('error', function (err) {
    t.equals(err, 'mesurement should be string', 'mesurement should be string')
    t.end()
    ifError = true
  })

  influxDbLineProto.send({}, {
    value : 12
  }, {
    src : 'unit'
  }, new Date().getTime())

  setTimeout(function () {
    if (!ifError) { 
      throw new Error('send should throw error when mesurement is not a string')
    }
    
    t.end()    
  }, 2000)
})


test('should emit error when fields is not object', function (t) {
  var influxDbLineProto = new InfluxDbLineProto('127.0.0.1', '8092')
  var ifError = false
  influxDbLineProto.on('error', function (err) {
    t.equal(err, 'fields should be an Object', 'fields should be an Object')
    t.end()
    ifError = true
  })

  influxDbLineProto.send('test', 'test', {
    src : 'unit'
  }, new Date().getTime())

  setTimeout(function () {
    if (!ifError) { 
      throw new Error('send should throw error when fields is not an object')
    }
    t.end()
  }, 2000)
})

test('should emit error when tags is not an object', function (t) {
  var influxDbLineProto = new InfluxDbLineProto('127.0.0.1', '8092')
  var ifError = false
  influxDbLineProto.on('error', function (err) {
    t.equal(err, 'tags if provied should be an object', 'tags if provied should be an object')
    t.end()
    ifError = true
  })

  influxDbLineProto.send('test', {}, 'test', new Date().getTime())

  setTimeout(function () {
    if (!ifError) { 
      throw new Error('send should throw error when fields is not an object')
    }
    t.end()
  }, 2000)
})