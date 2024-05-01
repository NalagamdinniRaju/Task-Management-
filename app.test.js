// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const app = require('./app.js');

// describe('Test API endpoints', () => {
//   let server;
//   let token;

//   beforeAll(async () => {
//     // Generate JWT token for testing
//     token = jwt.sign({ username: 'testuser' }, 'SECRECT_KEY'); // Corrected the typo in 'SECRECT_KEY'

//     // Start the server
//     server = app.listen(3000, () => {
//       console.log('Server is running on http://localhost:3000');
//     });
//   });

//   afterAll(async () => {
//     // Close the server
//     server.close();
//   });

//   it('should fetch all tasks', async () => {
//     const res = await request(app)
//       .get('/tasks')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(200);
//     expect(Array.isArray(res.body)).toBeTruthy();
//   });

//   it('should fetch a specific task', async () => {
//     const res = await request(app)
//       .get('/tasks/7') // Assuming task with ID 7 exists
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(200);
//     expect(res.body.id).toEqual(7); // Assuming the task ID 7 exists
//   });

//   it('should return 404 if task not found', async () => {
//     const res = await request(app)
//       .get('/tasks/532')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(404);
//   });

//   it('should add a new task', async () => {
//     const res = await request(app)
//       .post('/tasks')
//       .send({
//         title: 'Test Task',
//         description: 'This is a test task',
//         status: 'pending',
//         assignee_id: 1
//       })
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(201); // Assuming the endpoint returns 201 for successful creation
//   });

//   it('should update a task', async () => {
//     const res = await request(app)
//       .put('/tasks/1') // Assuming task with ID 1 exists
//       .send({
//         title: 'Updated Task',
//         description: 'This is an updated test task',
//         status: 'completed',
//         assignee_id: 1
//       })
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(200);
//   });

//   it('should delete a task', async () => {
//     const res = await request(app)
//       .delete('/tasks/5') // Assuming task with ID 5 exists
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.statusCode).toEqual(200);
//   });
// });
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./app.js');

describe('Test API endpoints', () => {
  let token;

  beforeAll(() => {
    // Generate JWT token for testing
    token = jwt.sign({ username: 'testuser' }, 'SECRECT_KEY');
  });

  it('should fetch all tasks', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('should fetch a specific task', async () => {
    const res = await request(app)
      .get('/tasks/7')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(7); // Check if task with id 1 exists
  });

  it('should return 404 if task not found', async () => {
    const res = await request(app)
      .get('/tasks/532')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404); // Expect 404 if task not found
  });

  it('should add a new task', async () => {
  const res = await request(app)
      .post('/tasks')
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        assignee_id: 1
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(201); // Assuming the endpoint returns 201 for successful creation
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put('/tasks/5')
      .send({
        title: 'Updated Task',
        description: 'This is an updated test task',
        status: 'completed',
        assignee_id: 1
      })
      .set('Authorization',` Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete('/tasks/5')
      .set('Authorization',` Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });
});
