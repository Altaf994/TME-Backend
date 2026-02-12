require('dotenv').config();
console.log('USE_PG='+process.env.USE_PG);
const {Pool}=require('pg');
const bcrypt=require('bcryptjs');
(async()=>{
 const pool=new Pool({connectionString:process.env.DATABASE_URL});
 try{
  const res=await pool.query('SELECT * FROM "User" WHERE username=$1 LIMIT 1',['hassan']);
  if(!res.rowCount){ console.log('DB: user not found'); process.exit(0);} 
  const user=res.rows[0];
  console.log('DB: found user id=',user.id);
  console.log('DB: password hash=',user.password);
  const match=await bcrypt.compare('Hassan@123',user.password);
  console.log('bcrypt match:',match);
 }catch(e){console.error('ERR',e.message);}finally{ await pool.end();}
})();
