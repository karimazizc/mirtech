Api = FastAPI backend



#  Start PSQL 

Login psql: 

```zsh
psql postgresql
# or
psql mirtech
# or 
psql -U mirtech_admin -b mirtech -p 5432 -h localhost
```
Cheat sheet

Database design:

https://dbdiagram.io/d/69280639a0c4ebcc2bf31328

Setup instructions:


Performance optimization techniques implemented:
Indexing

Architecture decisions: 
Redis + PostgreSQL + FastAPI  -> Next.js + React.js

Redis to cache and preload the fact table data for periods above 3 months for faster loads.
PostgreSQL to handle large amount of data.
FastAPI for quick REST api handling and serializing
Next.js and react.js + tailwind cssfor frontend for cleaner dashboard design and client side handling.
Uses python faker to generate mock up data of more than 100,000 rows in total.



What can be improved if I have more time:
- Dark mode
- Improvement on the data table (only showed the first 1000 and load more when scrolled)
- More filtering options accompanied with GraphQL
- Revenue sankey diagram
- More products / transactions plot
- Forecasting of sales by categories for the next Quarter
- Sales report for each Quarter (Q1, Q2, Q3, Q4) 
- Login page
- Authentication and Authorization 
- 'Share' link button that everyone can access to see sales report
- Built-in report generation using LLM
- AI search with pre defined context to finetune with appropriate RAG 
-
