const dbAddr = process.env.NODE_ENV === 'prod'
  ? `mongodb://${process.env.monster_almanac_dbuser_prod}:${process.env.monster_almanac_dbpass_prod}@ds125481.mlab.com:25481/bestiary`
  : `mongodb://${process.env.monster_almanac_dbuser_dev}:${process.env.monster_almanac_dbpass_dev}@ds125481.mlab.com:25481/bestiary`

module.exports = {
  dbAddr
}
