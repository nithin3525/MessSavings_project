
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
const bodyparser = require("body-parser");
const encoder = bodyparser.urlencoded();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use("/images",express.static('images'));
app.use("/style",express.static("style"));
app.use(bodyparser.json())
app.use(express.json())
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nithin@3525',
  database: 'nodejs'
})

connection.connect(function(error){
    if(error) throw error
    else console.log("connected to the database successfully!")
});
app.get("/",function(req,res){
    //res.json({"message":"logged in"})
     res.render(__dirname+"/htmlfiles/Home_page.ejs");
})
app.get("/htmlfiles/Home_page.ejs",function(req,res){
    //res.json({"message":"logged in"})
     res.render(__dirname+"/htmlfiles/Home_page.ejs");
})
app.get("/htmlfiles/Login.ejs",function(req,res){
    res.render(__dirname+"/htmlfiles/Login.ejs");
})
app.get("/htmlfiles/signup.ejs",function(req,res){
    res.render(__dirname+"/htmlfiles/signup.ejs");
})
 
app.post('/htmlfiles/signup.ejs',encoder,function(req,res){
    var name = req.body.name;
     var rollno = req.body.rollno;
    var email = req.body.email;
    var password = req.body.password;
    var year = req.body.year;
    var mobile = req.body.mobile;
     
     connection.query('insert into signup values ("'+name+'","'+rollno+'","'+email+'","'+password+'","'+year+'","'+mobile+'",90,curdate()-interval 1 day)',function(err, results,fields) {
    if (err){
        throw err
    } else {
            res.redirect("/htmlfiles/mess_savings.ejs");

    }
        res.end();
    })
})
app.get("/htmlfiles/mess_savings.ejs",function(req,res){
    // res.json({"message":"logged in"})
     res.render(__dirname+"/htmlfiles/mess_savings.ejs");
})

//for feedback
app.post('/htmlfiles/feedback.ejs',encoder,function(req,res){
    var rollno = req.body.rollno;
    var rating = req.body.rating;
    var message = req.body.message;
   //var password = req.body.password;
   //connection.query('insert into signup values(rollno,email,password)')
    connection.query('insert into feedback (rollno,rating,message,date) values ("'+rollno+'","'+rating+'","'+message+'",CURDATE())',function(err, results,fields) {
   if (err){
       throw err
   } else {
           res.redirect("/htmlfiles/feedback.ejs");
   }
       res.end();
   })
})
app.get("/htmlfiles/timetable.ejs",function(req,res){
    res.render(__dirname+"/htmlfiles/timetable.ejs")
})
app.get("/htmlfiles/feedback.ejs",function(req,res){
   // res.json({"message":"logged in"})
    res.render(__dirname+"/htmlfiles/feedback.ejs");
})
//ADMIN PAGE
app.get("/htmlfiles/adminLogin.ejs",function(req,res){
    res.render(__dirname+"/htmlfiles/adminLogin.ejs");
})
app.post('/htmlfiles/adminLogin.ejs',encoder,function(req,res){
    var username = req.body.username;
    var password = req.body.password;
        const query1 = 'SELECT * FROM admin where adminEmail = "'+username+'" and password ="'+password+'"';
        const query = "SELECT rating, COUNT(*) AS `count` FROM feedback GROUP BY rating";
        connection.query(query, (error, results, fields) => {
            if (error) throw error;
            const query2 = "SELECT COUNT(*) AS `count` FROM feedback GROUP BY date having date = curdate-interval 1 day";
            connection.query(query, (error, results2, fields) => {
            if (error) throw error;
            res.render('admin', { data: results,data1:results2 });
         });
    });
          
});
 

//usepoint page
 
app.post('/htmlfiles/Login.ejs',encoder,function(req,res){
    var username = req.body.username;
    var password = req.body.password;
     connection.query('SELECT studentName,rollno,points,date FROM signup WHERE email = "'+username+'" AND password = "' +password+'" ',function(err, results,fields) {
    if (err){
        throw err
    } else {
        if (results.length > 0){
             res.render('book',{users:results,message : "none"});
        }else{
             
            //res.json({"message":"enter the correct details!!"})
            res.redirect("/htmlfiles/Login.ejs");
           
        }
    }
        res.end();
    })
})

app.post('/usePoint', (req, res) => {
    var rollno = req.body.rollno;
    const alert = "Today's point is already in use" ;
    // update the user's points in the database
    // const sql = 'UPDATE signup SET points = points - 1 WHERE rollno = ?';
    connection.query('UPDATE signup SET points = points - 1 WHERE rollno ="'+rollno+'" and date !=curdate()', (err, results) => {
      if (err) throw err;
  
      // retrieve the updated user details from the database
    //   const getUserSql = 'SELECT * FROM users WHERE rollno = ?';
        connection.query('UPDATE signup SET date = curdate() WHERE rollno ="'+rollno+'"', (err, results) => {
            if (err) throw err;
            connection.query('SELECT studentName,rollno,points,date FROM signup WHERE rollno = "'+rollno+'" ', (err, results) => {
                if (err) throw err;
        
                // render the HTML page with the updated user details
                res.render('book', { users : results,message : "none"});
            });
        });
   
  });
});

//attendance

app.get("/htmlfiles/attendance.ejs",(req, res) =>{
    res.render(__dirname+"/htmlfiles/attendance.ejs");
})
app.post('/present', (req, res) => {
    var rollno = req.body.rollno;
    var attendance = req.body.attendance;
    console.log(rollno);
    let sql;
    if (attendance === "yes") {
        // update date in mysql database if attendance is "yes"
        sql =  'INSERT INTO attendance (rollno, date) VALUES ("'+rollno+'", curdate()) ON DUPLICATE KEY UPDATE date=curdate()';
        connection.query(sql, (err, result) => {
            if (err){
                throw err
            } else {
                    res.redirect("/htmlfiles/attendance.ejs");
            }
            res.end();
            
        });
    } 
     
});
  

app.listen(8000);
