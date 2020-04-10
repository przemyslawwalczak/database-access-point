Profile.update({
  values: {
    name: 'Hello world'
  },

  where: {
    uuid: previous
  }
})

Profile.query(transaction)
.SELECT('name')
.WHERE('uuid =', 'test-uuid')
.JOIN(() => {
  return Email.query()
  .ON('related')
  .ORDERBY('created', 'DESC')
  .LIMIT(1)
})
.LIMIT(1)
.promise()

Profile.select({
  values: ['name'],
  where: {
    uuid: 'test-uuid'
  },
  join: Email.join({
    on: 'related',
    orderby: 'created DESC'
  })
})