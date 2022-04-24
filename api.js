module.exports = function (app, db) {

	app.get('/api/test', function (req, res) {
		res.json({
			name: 'joe'
		});
	});

	app.get('/api/garments', async function (req, res) {

		const { gender, season } = req.query;
		let garments = [];

		if(gender && season){
			garments = await db.many('select * from garment where gender = $1 and season = $2', [gender, season])
		}else if(gender && !season){
			garments = await db.many('select * from garment where gender = $1', [gender])
		}else if(season && !gender){
			garments = await db.many('select * from garment where season = $1', [season])
		}else {
			garments = await db.many('select * from garment')
		}
		// add some sql queries that filter on gender & season
		res.json({
			data: garments
		})
	});

	app.put('/api/garment/:id', async function (req, res) {

		try {

			// use an update query...

			const { id } = req.params;
			const garment = await db.oneOrNone(`select * from garment where id = $1`, [id]);
			// you could use code like this if you want to update on any column in the table
			// and allow users to only specify the fields to update

			let params = { ...garment, ...req.body };
			const { description, price, img, season, gender } = params;

			let statement = `update garment set`
			let hasBeenUpdated = false

			if(description){
				hasBeenUpdated = true
				await db.none(`${statement} description = $1 where id = $2`, [description, id])
			}
			
			if(price && hasBeenUpdated){
				await db.none(`${statement} price = $1 where id = $2`, [price, id])
			}
			
			if(img && hasBeenUpdated){
				await db.none(`${statement} img = $1 where id = $2`, [img, id])
			}
			
			if(season && hasBeenUpdated){
				await db.none(`${statement} season = $1 where id = $2`, [season, id])
			}
			
			if(gender && hasBeenUpdated){
				await db.none(`${statement} gender = $1 where id = $2`, [gender, id])
			}


			res.json({
				status: 'success'
			})
		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});

	app.get('/api/garment/:id', async function (req, res) {

		try {
			const { id } = req.params;
			// get the garment from the database
			const garment = await db.one('select * from garment where id=$1',[id]);

			res.json({
				status: 'success',
				data: garment
			});

		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});


	app.post('/api/garment/', async function (req, res) {

		try {

			const { description, price, img, season, gender } = req.body;

			// insert a new garment in the database

			db.none(`insert into garment (description, price, img, season, gender) values($1, $2, $3, $4, $5)`, [description, price, img, season, gender])

			res.json({
				status: 'success',
			});

		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});

	app.get('/api/garments/grouped', async function (req, res) {
		const result = []		
		// use group by query with order by asc on count(*)
		result = await db.many(`select count(*) from garment group by gender`)
		res.json({
			data: result
		})
	});


	app.delete('/api/garments', async function (req, res) {

		try {
			const { gender } = req.query;
			// delete the garments with the specified gender
			await db.none('delete from garment where gender = $1', [gender])

			res.json({
				status: 'success'
			})
		} catch (err) {
			// console.log(err);
			res.json({
				status: 'success',
				error : err.stack
			})
		}
	});
}