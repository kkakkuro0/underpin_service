var express = require("express");
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
let db = new sqlite3.Database('./db/underpin.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

/* GET board page. */
router.get("/", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const user_id = req.session ? req.session.user_id : "";
    const getReleasesQuery = "select * from board order by board_idx desc";
    db.all(getReleasesQuery, (err, rows) => {
        if (err) return err;
        res.render('board', { logined, boards: rows, user: user_id });
    });
});

//글작성 입장
router.get("/write", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    if(logined === undefined) {
        res.write("<script charset='utf-8'>alert('로그인이 필요합니다.')</script>");
        res.write("<script>window.location=\"../board\"</script>");
    }else{
        console.log('글작성 입장~~~~')
        res.render('board_write', { logined });
    }
});

//글 작성!!!!
router.post("/write", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    console.log('글작성 하는중~~');
    const { title, contents} = req.body;
    const board_id = req.session.user_id;
    var dt = new Date();
    const board_date = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate();
    const board_update = board_date;
    console.log(board_id, title, contents, board_date);
    const query = `insert into board(user_id, board_title, board_content, board_date, board_update) values ('${board_id}', '${title}', '${contents}', '${board_date}', '${board_date}')`
    if (!title) {
        res.write("<script charset='utf-8'>alert('제목을 입력해주세요.')</script>");
        res.write("<script>window.location=\"../board/write\"</script>");       
    } else if (!contents) {
        res.write("<script charset='utf-8'>alert('내용을 입력해주세요.')</script>");
        res.write("<script>window.location=\"../board/write\"</script>");          
    } else {
        db.serialize();
        db.each(query);    
        const logined = req.session ? req.session.logined : false;
        const user_id = req.session ? req.session.user_id : "";
        const getReleasesQuery = "select * from board order by board_idx desc";
        db.all(getReleasesQuery, (err, rows) => {
            if (err) return err;
            res.render('board', { logined, boards: rows, user: user_id });
        });
    }
});

// 글 상세보기!!
router.get("/:id", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const user_id = req.session ? req.session.user_id : "";
    const findDetailQuery = `select * from board where board_idx=${req.params.id}`;
    const findReplyQuery = `select * from reply where board_idx=${req.params.id}`;

    db.get(findDetailQuery, (err, row) => {
        if (err) return err;
        db.all(findReplyQuery, (err, rows) => {
            if (err) return err;
            console.log(row)
            res.render('board_detail', { logined, replys: rows, user: user_id, detail: row, isMine: user_id === row.user_id });
        });
    });
});

router.post("/:id", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const user_id = req.session ? req.session.user_id : "";
    const comment = req.body.comment;
    console.log(req.body)
    const reply_id = req.session.user_id;
    var dt = new Date();
    const reply_date = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate();
    const reply_update = reply_date;
    const query = `insert into reply(board_idx, user_id, reply_content, reply_date, reply_update) values ('${user_id}', '${reply_id}', '${comment}', '${reply_date}', '${reply_update}')`
    if (!comment) {
        console.log('11111111111111111111111')
        res.write("<script charset='utf-8'>alert('내용을 입력해주세요.')</script>");
        res.write("<script>window.location=\"../board/detail\"</script>");  
          
    }else {
        console.log('22222222222222222222222')
        db.serialize();
        db.run(query);
        res.render('board_detail')
    }
});

module.exports = router;