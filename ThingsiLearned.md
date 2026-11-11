1. What is .venv and why do we create it?
> When you install Python on your computer, it puts it in your system (which is why it's in your environmental variables). 
> If you were to install packages (like FastAPI or SQLAlchemy) directly into that main Python installation, they would mix with other projects.
> If Project A needs Version 1 of a tool, and Project B needs Version 2, installing them globally will break one of the projects.
> .venv (Virtual Environment) is exactly what it sounds like: a magic isolated bubble. When you create .venv, Python makes a copy of itself specifically for your fitpulse project. 
> Any package you install inside this bubble stays inside the fitpulse/backend folder and doesn't affect the rest of your computer.
> using ``` python -m venv .venv ```

2. What is .\.venv\Scripts\activate?
> When you type this, you are telling VS Code:
> Stop using the global Python, and use the Python inside this local bubble for everything I type next.
>  You know it worked because the terminal shows (.venv) on the left.
> ``` .\.venv\Scripts\activate ```

3.Think of your backend like a restaurant:
> * The ```.env``` file is the VIP ```passcode``` to get into the kitchen.
> * ```config.py``` is the Manager who ```reads``` the passcode. We use a tool called ```pydantic``` to read the file
> * ```database.py``` is the Waiter who goes into the kitchen to ```get``` your food. Python app needs SQLAlchemy to talk to PostgreSQL.
> * ```test_db.py``` is the Food Critic we send in to ```make sure the Waiter and Manager are doing their jobs``` before we open the restaurant to the public.
> * so you can delete test_db.py once you checked everything is connected and working perfectly

4.MySQL vs. PostgreSQL
> * Both are Relational Databases (RDBMS). They both use tables, rows, columns, and SQL
> * PostgreSQL is much stricter about following the SQL standard.
> * PostgreSQL is the industry standard for modern Python/FastAPI applications, and it plays beautifully with SQLAlchemy.
> * I used a JDBC driver and wrote raw SQL strings (e.g., "SELECT * FROM users WHERE id = 1") inside my Java code before.
> * SQLAlchemy is an ORM (Object-Relational Mapper) for Python. Instead of writing raw SQL, you write Python classes.
> * You write: db.query(User).filter(User.email == 'test@test.com').first()

5. what is Neon?
> * In my last project (QFit), i rented a virtual server (AWS EC2) and installed MySQL on it. AWS was both the server and the database host.
> * Neon is a Serverless PostgreSQL provider. It is a cloud service.
> * It is completely free, scales to zero when you aren't using it (so it costs $0), and requires no credit card.
> * FastAPI app is using SQLAlchemy to connect to Neon via a URL.

6.If wanted to move to AWS, the process would literally be:
> * Go to AWS RDS, create a PostgreSQL database.
> * Copy the new AWS connection string.
> * Paste it into your .env file, replacing the Neon URL.
> * Restart your app.

