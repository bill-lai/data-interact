var a = {
  name: 'a'
}

var b = {
  name: 'b',
  a: a
}

a.b = b

let za = responsive(a)
let zb = responsive(b)

zb.api.listen(args => {
  console.log('zb', args)
})


za.api.listen(args => {
  console.log('za', args)
})