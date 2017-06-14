/**
 * Created by 13944 on 2017/6/14.
 */

require('./DBModule/Start')
    .connect("mongodb://localhost:27017/ChunkyRemodel")
    .then(()=>{
        require("./DBModule/Operation");
    }).catch(msg=>{
        console.info(`err:${msg}`)
});


