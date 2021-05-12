const { Client } = require('pg')
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'rtcnode',
  password: 'qwertyui',
  database: 'contacts'
})

const querySelectAll = 'SELECT * FROM contacts'
const queryUpdateActive = 'UPDATE contacts SET reg=$1 WHERE number=($2)'
async function reloadNumbers() {
  try {
    return (await client.query(querySelectAll)).rows
  } catch (err) {
    console.error(err)
    return []
  }
}
const wsMap = new Map();
async function main() {
  await connect()
  // Numbers = await reloadNumbers()
}

 module.exports = {
       main,
    reloadNumbers
  }



// async function updateActive (act, number) {
//   try{
//     await client.query(queryUpdateActive, [act, number])
//   }catch(err){
//     console.error(err)
//   }
// } 

async function connect() {
  try {
    await client.connect()
    console.log('DB connected')
  } catch (err) {
    console.error('connection error', err.stack)
  }


  //  => {
  //   if (err) {
  //     console.error('connection error', err.stack)
  //   } else {
  //     console.log('DB connected')
  //   }
  // })
}

// main()


