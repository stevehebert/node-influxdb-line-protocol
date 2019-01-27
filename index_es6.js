'use strict'
var net = require('net')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var Rx = require('rxjs')
let __instances = new Map()

util.inherits(influx_line_udp, EventEmitter)

function influx_line_udp (host, port) {
  var self = this
  EventEmitter.call(self)

  if (__instances.get(port)) {
    console.log('found the writer')
    self.writer = __instances.get(port)
    return
  }
  // console.log('writers', __instances)
  // console.log('did not find the writer')
  self.writer = {
    host: host,
    port: port,
    packetStream: new Rx.Subject(),
    clientConnection: net.createConnection(port, host)
  }

  // console.log('setting the subscriber')

  __instances.set(port, self.writer)
  // console.log('set writer', __instances)

  self.writer.packetStream.subscribe(x => {
    console.log('writing to port', self.writer.port)
    self.writer.clientConnection.write(x)
    self.writer.clientConnection.write('\n')
    console.log('wrote to port')
  }, e => {
    // output to stdout
    console.error('influx client connection died')
  }, () => {
    // stream concluded.
    console.log('influx client connection ended')
  })
}

module.exports = influx_line_udp

influx_line_udp.prototype.send = function (mesurement, fields, tags = {}, timestamp = undefined) {
  let self = this
  if (!mesurement || typeof mesurement !== 'string') {
    return self.emit('error', 'mesurement should be string')
  }

  mesurement = escape(mesurement)

  if (!fields || !isObject(fields)) {
    return self.emit('error', 'fields should be an Object')
  }

  let escaped_fields_array = []
  let unescaped_fields_keys = Object.keys(fields) || []
  for (let i = 0; i < unescaped_fields_keys.length; i++) {
    escaped_fields_array.push(escape(unescaped_fields_keys[i]) + '=' + fields[unescaped_fields_keys[i]])
  }
  let escaped_fields_str = escaped_fields_array.join(',')

  let escapeTags = ''

  if (!isObject(tags)) {
    return self.emit('error', 'tags if provied should be an object')
  }

  let esapedTagsArray = []
  for (let tagKey in tags) {
    esapedTagsArray.push(escape(tagKey), escape(tags[tagKey]))
  }
  escapeTags = esapedTagsArray.join(',')

  let data = `${mesurement}${escapeTags.length > 0 ? ',' + escapeTags : ''} ${escaped_fields_str}${timestamp ? ' ' + timestamp : timestamp}`

  self.writer.packetStream.next(data)
}

function isObject (obj) {
  let type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

function escape (str) {
  return str.split('').map(function (character) {
    if (character === ' ' || character === ',') {
      character = '\\' + character
    }
    return character
  }).join('')
}
