## **Objective**

Create a high-performance data table that handles 100,000+ records with instantaneous response times.

## **Tech Stack**

*   Backend: FastAPI
*   Frontend: NextJS with TypeScript
*   Deployment: Docker Compose

## **Requirements**

### **Backend (FastAPI)**

*   Create REST API endpoints for data retrieval with filtering, sorting, and pagination
*   Generate and seed a database with 100,000+ realistic records (products, users, orders, transactions etc)
*   Implement caching and query optimization to achieve <100ms response times
*   Add appropriate error handling and validation

### **Frontend (NextJS)**

*   Build a responsive data table/grid with virtual scrolling
*   Build a responsive view item page
*   Implement instant client-side search, filtering, and sorting
*   Create a clean, intuitive UI (using component libraries like shadcn is welcome)
*   Add thoughtful loading states and error handling

### **Performance Requirements**

*   All API responses must complete in under 100ms
*   UI must remain responsive during all operations
*   Smooth scrolling through large datasets without performance degradation
*   Initial page load under 2 seconds

### **Docker Setup**

*   Configure complete application to start with a single docker compose up command
*   Include all necessary services (backend, frontend, database, cache)
*   Set up appropriate networking between containers

## **Submission**

*   GitHub repository with clear structure and documentation

*   Comprehensive README explaining:

    *   Setup instructions
    *   Performance optimization techniques implemented
    *   Architecture decisions
    *   UI/UX considerations

*   Brief reflection on what you would improve with more time (1-2 paragraphs)

## **Evaluation Criteria**

*   Code quality and architecture
*   Performance optimization techniques
*   Problem-solving approach for large datasets
*   UI/UX design and usability
*   Docker implementation
*   Documentation quality

This assessment tests your ability to build applications that balance technical performance with excellent user experience—a crucial skill for modern full-stack development.
