(function(){Users = new Meteor.Collection("user");
Tasks = new Meteor.Collection("task");

if (Meteor.isClient) {

    // This code only runs on the client
    Template.body.helpers({
        users: function () {
            if (Session.get("hideCompleted")) {
                // If hide completed is checked, filter tasks
                return Users.find({});
            } else {
                // Otherwise, return all of the tasks
                return Users.find({}, {});
            }
        },
        user_details:function () {
            var User_Id = Session.get("user_id");
            return Users.find({_id:User_Id});
        },
        tasks: function () {
            if (Session.get("hideCompleted")) {
                var sort_method = Session.get('sort') || 'dateCreated';

                if(sort_method=='name') {
                    return Tasks.find({completed: false}, {skip: Session.get('skip'), limit:5, sort: {name: Session.get('ascending')}});
                }
                else if(sort_method=='dateCreated'){
                    return Tasks.find({completed: false}, {skip: Session.get('skip'), limit:5, sort: {dateCreated: Session.get('ascending')}});
                }
            } else {
                var sort_method = Session.get('sort') || 'dateCreated';;
                console.log(sort_method);
                if(sort_method=='name') {
                    return Tasks.find({}, {skip: Session.get('skip'), limit:5, sort: {name: Session.get('ascending')}});
                }
                else if(sort_method=='dateCreated'){
                    return Tasks.find({}, {skip: Session.get('skip'), limit:5, sort: {dateCreated: Session.get('ascending')}});
                }
            }
        },
        task_details:function () {
            var Task_Id = Session.get("task_id");
            return Tasks.find({_id:Task_Id});

        },
        hideCompleted: function () {
            return Session.get("hideCompleted");
        },

        isUser: function () {
            return Session.get("isUser");
        },
        isTask: function () {
            return Session.get("isTask");
        },
        isUserDetail: function () {
            return Session.get("isUserDetail");
        },
        isTaskDetail: function () {
            return Session.get("isTaskDetail");
        },
        isTaskEdit:function () {
            return Session.get("isTaskEdit");
        },

        Message:  function () {
            return Session.get("Message");
        }




    });
    Template.task_edit.helpers({
        users: function () {
            if (Session.get("hideCompleted")) {
                return Users.find({}, {});
            } else {
                return Users.find({});
            }
        }

    });
    Template.user_detail.helpers({
        pendingTaskNames:  function () {
            return Session.get("pendingTaskNames");
        }

    });
    Template.user_detail.events({

    });
    Template.body.events({
        "submit .update-task":function (event) {
            var taskname = event.target.taskname.value;
            var description  = event.target.description.value;
            var deadline = event.target.deadline.value;
            var completed = event.target.completed.value;
            var assignedUserName = event.target.assignedUser.value;
            var assignedUser = Users.findOne({name:assignedUserName})._id;
            var TaskID = Session.get("task_id");

            Meteor.call('editTask',TaskID, taskname, description, deadline, completed, assignedUser, assignedUserName, function(err, msg){
                Session.set("Message",msg);
                console.log(msg);
            });

            event.target.taskname.value = "";
            event.target. description.value = "";
            return false;
        },
        "click .setComp": function(){
            Meteor.call('markComplete', this._id, function(err, msg){
                Session.set('Message', msg);
                console.log(msg);
            });
            Meteor.call('getTaskName', this.parentid, function(err, ret){
                Session.set("pendingTaskNames",ret);
            });
            //var task = Tasks.findOne({_id: this._id});
            //console.log(task);
            //Session.set('complete', task.completed);
            //Session.get('pendingTask');
            //Meteor.call('getTaskName', )
        },
        "click .ascending": function(){
            Session.set('ascending', 1);
        },
        'click .descending': function(){
            Session.set('ascending', -1);
        },
        "click .prev": function(){
            //var vSkip = Session.get('skip');
            var length = Tasks.find().fetch().length;
            if(Template.body.skip - 5 >= 0){
                Template.body.skip -= 5;
            }
            else if(Template.body.skip - 5 < 0){
                Template.body.skip = 0;
            }
            Session.set('skip', Template.body.skip);

            //Template.body.skip+10)
            //Session.set();
            console.log(Template.body.skip);
        },
        "click .next": function(){
            var length = Tasks.find().fetch().length;
            console.log(length);
            if(Template.body.skip + 5 < length){
                Template.body.skip += 5;
            }
            Session.set('skip', Template.body.skip);
            //console.log(Template.body.skip);
        },

        "submit .new-user":function (event) {
            // This function is called when the new task form is submitted

            var username = event.target.username.value;
            var email  = event.target.email.value;
            console.log(event);

            Meteor.call('insertUser', username, email, null, function(err, msg){
                Session.set('Message', msg);
            });
            // Clear form

            event.target.username.value = "";
            event.target.email.value = "";
            // Prevent default form submit
            return false;
        },

        "submit .new-task":function (event) {
            // This function is called when the new task form is submitted

            var taskname = event.target.taskname.value;
            var description  = event.target.description.value;
            var deadline = event.target.deadline.value;
            var completed = event.target.completed.value;
            var assignedUserName = event.target.assignedUser.value;
            //var assignedUserName = event.target.assignedUserName.value;
            console.log(event);
            Meteor.call('insertTask', taskname, description, deadline, completed, "", assignedUserName, function(err, msg){
                Session.set('Message', msg);

                console.log(msg);
            });

            event.target.taskname.value = "";
            event.target. description.value = "";
            // Prevent default form submit
            return false;
        },

        "change #sort": function(event){
            console.log(event.target.value);
            Session.set('sort', event.target.value);
            //var sort_method = Session.get('sort');
            //console.log("aaa");
        },

        "click .User_delete": function () {
            //Users.remove(this._id);
            Meteor.call('deleteUser', this._id, function(err, msg){
                Session.set('Message', msg);

                console.log(msg);
            });
        },
        "click .Task_delete": function () {
            //Tasks.remove(this._id);
            Meteor.call('deleteTask', this._id, function(err, msg){
                Session.set('Message', msg);

                console.log(msg);
            });
        },
        "change .hide-completed input": function (event) {
            Session.set("hideCompleted", event.target.checked);
        },

        "click .user": function () {
            Session.set("isUser",true);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
        },

        "click .task": function () {
            Session.set("isUser",false);
            Session.set("isTask",true);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
        },
        "click .user_id": function () {
            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",true);
            Session.set("isTaskEdit",false);
            Session.set("user_id",this._id);
            Meteor.call('getTaskName', this._id, function(err, ret){
                Session.set("pendingTaskNames",ret);
            });
        },
        "click .task_id": function () {
            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",true);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
            Session.set("task_id",this._id);

        },
        "click .task_edit": function () {

            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",true);
            Session.set("task_id",this._id);

        }

    });



    Template.body.isUser =  true;
    Template.body.isTask =  false;
    Template.body.isUserDetail =  false;
    Template.body.isTaskDetail =  false;
    Template.body.isTaskEdit = false;
    Template.body.skip = 0;
    Template.body.sort = 'dateCreated';
}

if(Meteor.isServer){


}

})();
