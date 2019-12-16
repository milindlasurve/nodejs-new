/** 
 * @author:Akshay Misal
 * @version:0.2
 * @since:23-July-2019
*/
var server = require('./../server/routers/app.routes');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var fs = require('fs');

chai.use(chaiHttp);

/**
 * @author Akshay Misal
 * @link: POST /
 * @description 
 * @param {} req 
 * @param {JSONObject} res 
 */
describe('user', () => {
    it('This end point will create a new user', (done) => {

        var data = {
            "username": "Aniket",
            "firstName": "Aniket",
            "lastName": "Salvi",
            "mobileNumber": "9930381380",
            "email": "aniket@cateina.com",
            "password": "Aniket",
            "confirmPassword": "Aniket"
        }

        chai.request(server)
            .post('/api/user/register')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will authenticate a user', (done) => {

        var data = {
            "username": "Aniket",
            "password": "Aniket"
        }

        chai.request(server)
            .post('/api/user/login')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will change password', (done) => {

        var data = {
            "appName": "Users",
            "username": "Aniket",
            "oldPassword": "Aniket",
            "newPassword": "1234",
            "confirmPassword": "1234"
        }

        chai.request(server)
            .post('/api/user/changePassword')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point used for password recovery', (done) => {

        var data = {
            "appName": "Users",
            "username": "Aniket",
            "newPassword": "Aniket",
            "confirmPassword": "Aniket"
        }

        chai.request(server)
            .put('/api/user/forgetPassword')
            .query({ "username": data.username })
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will get user data by username', (done) => {

        chai.request(server)
            .get('/api/user/')
            .query({ "username": "Aniket" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will update user data', (done) => {

        var data = {
            "username": "Aniket",
            "firstName": "Aniket",
            "lastName": "Salvi",
            "mobileNumber": "8108082438",
            "email": "aniket@cateina.com"
        }

        chai.request(server)
            .put('/api/user/updateUser')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });


    // it('This end point will delete user data', (done) => {

    //     chai.request(server)
    //         .delete('/api/user/deleteUser')
    //         .query({ "username": "Aniket" })
    //         .send()
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             done();
    //         });
    // });

});

/***************************** Project Unit testing ***************************/

describe('Project', () => {
    it('This end point will create a new Project', (done) => {

        var data = {
            "projectId": "ProjectId12398",
            "projectName": "Test1",
            "version": "0.0.1"
        }

        chai.request(server)
            .post('/api/project/')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point get project data by projectId', (done) => {

        chai.request(server)
            .get('/api/project/Id')
            .query({ "projectId": "ProjectId12398" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will get all project', (done) => {

        chai.request(server)
            .get('/api/project/')
            .query({})
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will update project data', (done) => {

        var data = {
            "projectId": "ProjectId12398",
            "projectName": "Test2",
            "version": "0.0.2"
        }

        chai.request(server)
            .put('/api/project/')
            .query({ "projectId": "ProjectId12398" })
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will delete project data', (done) => {

        chai.request(server)
            .delete('/api/project/')
            .query({ "projectId": "ProjectId12398" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

});


/**************************** Product unit testing ******************************/

describe('Product', () => {
    it('This end point will create a new Product', (done) => {

        var data = {
            "productName": "Test1",
            "version": "0.0.1"
        }

        chai.request(server)
            .post('/api/product/')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point get product data by productId', (done) => {

        chai.request(server)
            .get('/api/product/')
            .query({ "productId": "PRODUCTID1565350928702" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will get all product', (done) => {

        chai.request(server)
            .get('/api/product/')
            .query({})
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will update product data', (done) => {

        var data = {
            "productId": "PRODUCTID1565351010788",
            "productName": "Test2",
            "version": "0.0.2"
        }

        chai.request(server)
            .put('/api/product/')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    // it('This end point will delete product data', (done) => {

    //     chai.request(server)
    //         .delete('/api/product/')
    //         .query({"productId": "PRODUCTID1565586240495"})
    //         .send()
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             done();
    //         });
    // });

});


/**************************** Service unit testing ******************************/

describe('Service', () => {
    it('This end point will create a new Service', (done) => {

        var data = {
            "serviceId": "serviceId12398",
            "serviceName": "Test1",
            "version": "0.0.1"
        }

        chai.request(server)
            .post('/api/service/')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point get service data by serviceId', (done) => {

        chai.request(server)
            .get('/api/service/Id')
            .query({ "serviceId": "ServiceId12398" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will get all services', (done) => {

        chai.request(server)
            .get('/api/service/')
            .query({})
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will update service data', (done) => {

        var data = {
            "serviceId": "serviceId12398",
            "serviceName": "Test2",
            "version": "0.0.2"
        }

        chai.request(server)
            .put('/api/service/')
            .query({})
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('This end point will delete service data', (done) => {

        chai.request(server)
            .delete('/api/service/')
            .query({ "serviceId": "serviceId12398" })
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

});

/**************************** Flow unit testing ******************************/

// describe('Flow', () => {

//     var filename = 'apiSequence.png';
//     var file = fs.readFileSync('test/' + filename);
//     console.log("file ==>", file)
//     it('This end point will create a new Flow', (done) => {
//         chai.request(server)
//             .post('/api/flow/?path=test&flowName=Test')
//             .field('Content-Type', 'multipart/form-data')
//             .attach('apiSequence', file)
//             .end((err, res) => {
//                 expect(res).to.have.status(200);
//                 done();
//             });
//     });

//     // it('This end point will create a new Flow', (done) => {
//     //     var filename = 'apiSequence.png'
//     //         , boundary = Math.random()

//     //     chai.request(server)
//     //         .post('/api/flow/?path=test&flowName=Test')
//     //         .set('Content-Type', 'multipart/form-data; boundary=' + boundary)
//     //         .write('--' + boundary + '\r\n')
//     //         .write('Content-Disposition: form-data; name="image"; filename="' + filename + '"\r\n')
//     //         .write('Content-Type: image/png\r\n')
//     //         .write('\r\n')
//     //         .write(fs.readFileSync('test/' + filename))
//     //         .write('\r\n--' + boundary + '--')
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

//     //******************************************

//     // it('This end point get flow data by flowId', (done) => {

//     //     chai.request(server)
//     //         .get('/api/flow/')
//     //         .query({ "flowId": "FlowId12398" })
//     //         .send()
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

//     // it('This end point will get all flow', (done) => {

//     //     chai.request(server)
//     //         .get('/api/flow/')
//     //         .query({})
//     //         .send()
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

//     // it('This end point will update flow data', (done) => {

//     //     var data = {
//     //         "flowId": "flowId12398",
//     //         "flowName": "Test2",
//     //         "version": "0.0.2"
//     //     }

//     //     chai.request(server)
//     //         .put('/api/flow/')
//     //         .query({ "flowId": "FLOWId12398" })
//     //         .send(data)
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

//     // it('This end point will delete flow data', (done) => {

//     //     chai.request(server)
//     //         .delete('/api/flow/')
//     //         .query({ "flowId": "FlowId12398" })
//     //         .send()
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

//     // it('This end point will get file', (done) => {

//     //     chai.request(server)
//     //         .get('/api/flow/apiKey.json')
//     //         .query({})
//     //         .send()
//     //         .end((err, res) => {
//     //             expect(res).to.have.status(200);
//     //             done();
//     //         });
//     // });

// });