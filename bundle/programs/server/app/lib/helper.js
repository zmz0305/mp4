(function(){Meteor.methods({
    insertUser:  function(name, email, pendingTasks) {

        if (name == '' || email == '') {
            return "missing user name or email.";
        }
        else {
            if (Users.findOne({'email': email})) {
                //console.log("a");

                return "duplicate email when adding user";
            }
            Users.insert({
                'name': name,
                'email': email,
                'pendingTasks': pendingTasks || [],
                'dateCreated': new Date()
            });
            return "user inserted.";
        }

    },

    insertTask: function(name, description, deadline, completed, assignedUser, assignedUserName){
        if(name == '' || deadline == ''){
            return "missing name or deadline.";
        }
        else{

            var temp = Users.findOne({name: assignedUserName});
            if(temp){
                assignedUserName = temp.name;
                //temp.pendingTasks.push();
                assignedUser = temp._id;
            }
            var in_task = Tasks.insert({
                'name': name,
                'description': description || "",
                'deadline': deadline,
                'completed': completed,
                'assignedUser': assignedUser || "",
                'assignedUserName': assignedUserName || "unassigned",
                'dateCreated': new Date()
            });
            console.log(in_task);
            if(completed == "False") {
                temp.pendingTasks.push(in_task);
                Users.update({_id: temp._id}, temp);
            }
            return "task inserted";
        }
    },

    deleteUser: function (id){
        //console.log(id);
        var dUser = Users.findOne({_id: id});
        //console.log(dUser);
        for(var i = 0; i < dUser.pendingTasks.length; i++){
            Tasks.update({_id: dUser.pendingTasks[i]}, {"$set": {assignedUser: "", assignedUserName: "unassigned"}});
        }
        var msg = Users.remove({_id: id});
        return msg + " user removed";
    },

    deleteTask: function (id){
        var dTask = Tasks.findOne({_id: id});
        var upUser = Users.findOne({_id: dTask.assignedUser});
        if(upUser && dTask.completed == "False"){
            for(var i = 0; i < upUser.pendingTasks.length; i++){
                if(upUser.pendingTasks[i] == id)
                    upUser.pendingTasks.splice(i, 1);
            }
            Users.update({_id: dTask.assignedUser}, upUser);
        }

        var msg = Tasks.remove({_id: id});

        return msg+" task deleted";
    },

    editTask: function (idToBeEdited, name, description, deadline, completed, assignedUser, assignedUserName){
        var assUser = Users.findOne({_id: assignedUser});
        var task = Tasks.findOne({_id: idToBeEdited});
        if(assUser && completed=="False"){
            assUser.pendingTasks.push(idToBeEdited)
            Users.update({_id: assUser._id}, assUser);
            Users.update({_id: task.assignedUser}, {"$set": {
                pendingTasks: []
            }});
        }
        if(name == '' || deadline == ''){
            return "missing name or deadline";
        }
        else{
            console.log("id to be updated: " + idToBeEdited);
            console.log('name: '+ name);
            var msg = Tasks.update({_id: idToBeEdited},{
                'name': name,
                'description': description,
                'deadline': deadline,
                'completed': completed,
                'assignedUser': assignedUser,
                'assignedUserName': assignedUserName
            });
            return msg + " tasks updated";
        }
    },
    getTaskName: function(userid){
        var user = Users.findOne({_id: userid});
        var taskArray = [];
        for(var i = 0; i < user.pendingTasks.length; i++){
            var task = Tasks.findOne({_id: user.pendingTasks[i]});
            console.log(task);
            //task.parentid = userid;
            var pair = {_id: task._id, name: task.name, completed: task.completed, parentid: userid};
            console.log(pair.parentid);
            taskArray.push(pair);
        }
        return taskArray;
    },
    //getTaskName: function(userid){
    //    var user = Users.findOne({_id: userid});
    //    var taskNames = [];
    //    for(var i = 0; i < user.pendingTasks.length; i++){
    //        var task = Tasks.findOne({_id: user.pendingTasks[i]});
    //        console.log(task);
    //        //var pair = [task._id, task.name];
    //        taskNames.push(task.name);
    //    }
    //    return taskNames;
    //},
    getUserId: function(name){
        var user = Users.findOne({name: name});
        return user._id;
    },
    getTaskId: function(name){
        var task = Tasks.findOne({name: name});
        return task._id;
    },
    markComplete: function(id){
        var task = Tasks.findOne({_id: id});
        task.completed = "True";
        var user = Users.findOne({_id: task.assignedUser});
        for(var i = 0; i < user.pendingTasks.length; i++){
            if(user.pendingTasks[i] == id){
                user.pendingTasks.splice(i, 1);
            }
        }
        var msg1 = Tasks.update({_id: id}, task);
        var msg2 = Users.update({_id: task.assignedUser}, user);
        console.log("mark complete");
        return msg1+"Tasks updated and "+msg2+" Users updated";

    }
});

})();
