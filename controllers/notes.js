const express = require('express');
const router = express.Router();
const db = require('../db');

router.use((req, res, next) => {
    if (req.sessionid && req.sessionid.user != undefined) {
        next();
    } else {
        res.redirect('/');
    }
});

// logout route 
router.get('/logout', (req, res) => {
    req.sessionid.reset();
    res.redirect('/');
});

// all notes display
router.get('/', (req, res) => {
    db.query('select * from notes', (error, rows) => {
        if (error) throw error;
        if (rows.length === 0) {
            res.send("no notes so far");
            return;
        } else {
            res.render('notes', {
                pagetitle: "Notes",
                notes: rows,
                user:req.sessionid.user  // passing it --> for checking user verified email or not
            });
        }
    });
});

// create new note 
router.get('/add', (req, res) => {
    res.render('add', {
        pagetitle: "Add Note"
    });
});

// post create new note 
router.post('/add', (req, res) => {
    // validation to be performed here
    // wherever the form is ==> then u should sanitize the input to prevent xss attacks
    var title = req.body.title;
    var body = req.body.desc;
    var userid = req.sessionid.user.id;
    db.query('insert into notes(title,body,userid) values(?,?,?)', [title, body, userid], (error, row) => {
        if (error) throw error;
        res.redirect('/notes');
    });
});

// show individual note detail 
router.get('/:id', (req, res) => {
    var id = req.params.id;
    db.query('select * from notes where id = ?', [id], (error, row) => {
        if (error) throw error;
        if (row.length == 0) {
            res.send("No note found with id" + id);
            return;
        } else if (row.length > 1) {
            res.send("Not possible");
            return;
        } else {
            var note = row[0];
            res.render('note', {
                pagetitle: note.title,
                notes: note
            });
        }
    });
});

// edit note
router.get('/edit/:id', (req, res) => {

    var id = req.params.id;
    db.query('select * from notes where id = ?', [id], (error, row) => {
        if (error) throw error;
        if (row.length == 0) {
            res.send("No note found with id" + id);
            return;
        } else if (row.length > 1) {
            res.send("Not possible");
            return;
        } else {
            var note = row[0];
            res.render('edit', {
                pagetitle: note.title,
                notes: note
            });
        }
    });
});

//edit note post
// when perform put operation  u cannot use browser use postman or ajax needed 
// coz browser cannot perform put
// when browse url u r inssuing get req
router.put('/edit/:id', (req, res) => {
    var title = req.body.title;
    var body = req.body.desc;
    var userid = req.sessionid.user.id;
    db.query('update notes set title=?,body=?,userid=? where id = ?', [title, body, userid, req.params.id], (error, row) => {
        if (error) throw error;
        console.log("updated success");
    });
    res.status(200);
    res.end();
    
});

// delete note 
router.delete('/delete/:id', (req, res) => {
    db.query('delete  from notes where id = ? ', [req.params.id], (error, row) => {
        if (error) throw error;
        res.status(200);
        res.end();
    });
});

module.exports = router;
    