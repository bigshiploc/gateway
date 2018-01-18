var Parser = require('binary-parser').Parser
var parser = new Parser()
    .endianess('little')
    .uint32('magic_header', {assert: 0x5aa555aa})
    .uint8('node_type')
    .uint32('node_id')
    .uint8('frame_type')
    .uint16('pkg_length')
    // .uint8('frame_id')
    // .uint16('reserved_2')
    // .uint8('reserved_3')
    .buffer('raw', {
        length: function () {
            return this.pkg_length;
        }
    })
    .uint8('raw_crc')


var Struct = require('struct');

var setting = Struct()
    .word8Ule('role')
    .word16Ule('base_id')
    .word8Ule('round_count')
    .word8Ule('channel_num')
    .word8Ule('prf')
    .word8Ule('datarate')
    .word8Ule('preamble_code')
    .word8Ule('preamble_length')
    .word8Ule('pac_size')
    .word8Ule('ns_sfd')
    .word16Ule('sfd_to')
    .word16Ule('tx_delay')
    .word16Ule('rx_delay')
    .word8Ule('pg_dly')
    .word32Ule('tx_power')
    .word24Ule('x')
    .word24Ule('y')
    .word24Ule('z')
    .word8Ule('ver_major')
    .word8Ule('ver_minor')
    .word64Ule('reserved_1')
    .word64Ule('reserved_2')
    .word8Ule('reserved_3')

var frame = Struct()
    .word32Ule('magic_header')
    .word8Ule('node_type')
    .word32Ule('node_id')
    .word8Ule('frame_type')
    .word16Ule('pkg_length')
    .struct('setting', setting)
    .word8Ule('raw_crc')

frame.allocate();
var buf = frame.buffer();

var proxy = frame.fields;
proxy.magic_header = 0x5aa555aa;
proxy.node_type = 2;
proxy.pkg_length = 50;

var crc = 0
buf.forEach(function (v, i) {
    console.log(i + ':' + v);
    crc = crc ^ v
})

console.log('crc', crc)
proxy.raw_crc = crc;

result = parser.parse(buf)
console.log(result)
