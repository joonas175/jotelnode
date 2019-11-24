const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: 'asd',
     connectionLimit: 5,
     database: 'jotel'
});

async function getPosts(user) {
    conn = await pool.getConnection()
    const posts = await conn.query('SELECT * FROM post ORDER BY timestamp DESC')
    //const likes = await conn.query('SELECT * FROM vote WHERE post_id = ?', posts)
    
    for(let post of posts){
        let votes = await conn.query('SELECT vote_value AS voteValue, user_id as userId FROM vote WHERE post_id = ?', post.id)

        post.votes = votes.map((value) => value.voteValue).reduce((acc, curr) => { return acc += curr }, 0);
        

        if(votes.find((value) => value.userId == user.id)){
            post.voted = true
        } else {
            post.voted = false
        }

        if(post.user_id == user.id){
            post.owned = true
        } else {
            post.owned = false
        }

    }

    conn.end()

	return posts
}

async function savePost(req, user) {

    let post = req.body

    conn = await pool.getConnection()

    const rows = await conn.query(`INSERT INTO post (message, user_id, color, timestamp) VALUES (?, ?, ?, ?)`, [post.message, user.id, post.color, new Date()])

    post.votes = 0
    post.voted = false
    post.owned = true
    post.id = rows.insertId

    conn.end()

    return post
}

async function deletePost(id, user) {
    conn = await pool.getConnection()

    const rows = await conn.query('DELETE FROM post WHERE id = ? AND user_id = ?', [id, user.id])

    conn.end()

    if(rows.affectedRows === 1){
        return `${id}`
    } else {
        return null
    }

}

async function votePost(id, dislike, user) {
    conn = await pool.getConnection()

    let votes = await conn.query('SELECT vote_value AS voteValue, user_id as userId FROM vote WHERE post_id = ?', id)

    if(!votes.find((value) => value.userId == user.id)){
        let voteValue = dislike ? -1 : 1
        await conn.query('INSERT INTO vote (post_id, vote_value, user_id) VALUES (?, ?, ?)', [id, voteValue, user.id])
        votes.push({voteValue: voteValue})
    }

    conn.end()
    return `${votes.map((value) => value.voteValue).reduce((acc, curr) => { return acc += curr }, 0)}`;
}

async function saveUser(identifier) {
    conn = await pool.getConnection()
    const rows = await conn.query(`INSERT INTO user (identifier) VALUES ('${identifier}')`)
    let user = {
        id: rows.insertId,
        identifier: identifier
    }
    conn.end()
    return user
    
}

async function findUserByIdentifier(identifier) {
    conn = await pool.getConnection()
    const rows = await conn.query(`SELECT * FROM user WHERE identifier = ?`, identifier)
    conn.end()
    return rows[0]
}



exports.getPosts = getPosts
exports.savePost = savePost
exports.deletePost = deletePost
exports.votePost = votePost
exports.saveUser = saveUser
exports.findUserByIdentifier = findUserByIdentifier