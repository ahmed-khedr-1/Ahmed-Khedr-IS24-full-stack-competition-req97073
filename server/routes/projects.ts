import { Request, Response, Router } from "express";
import { uuid } from "uuidv4";
import Project from "../../types/Project";
import { readJSONFile, updateJSONFile } from "../utils.js";

const router = Router();
const dataFileLocation = "./server/data.json";

// In-memory database of projects
const projects: Project[] = readJSONFile(dataFileLocation);

// GET endpoint to return all projects

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: The unique identifier for the product
 *         productName:
 *           type: string
 *           description: The name of the product
 *         productOwnerName:
 *           type: string
 *           description: The name of the product owner
 *         developers:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of developer names
 *         scrumMasterName:
 *           type: string
 *           description: The name of the scrum master
 *         startDate:
 *           type: string
 *           format: date
 *           description: The start date of the project
 *         methodology:
 *           type: string
 *           description: The project methodology used
 *
 * /api/projects:
 *   get:
 *     summary: Retrieve an array of project objects
 *     description: Returns an array of project objects containing the details of each project.
 *     responses:
 *       200:
 *         description: An array of project objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", (_req: Request, res: Response) => {
  res.json(projects);
});

// POST endpoint to add a new project
/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Adds a new project
 *     requestBody:
 *       description: Project object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: The new project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/", (req: Request, res: Response) => {
  const project = req.body;

  // Validate that all required fields are defined in the new object
  if (!validProject(project)) {
    return res
      .status(400)
      .json({ message: "All required fields must be defined." });
  }

  // Generate a unique ID for the new project
  project.productId = uuid();
  projects.push(project);

  // Update the file with the updated project
  updateJSONFile(dataFileLocation, projects);
  res.json(project);
});

// PUT endpoint to update an existing project
/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project by ID
 *     description: Updates an existing project by its ID in the database
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the project to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Project object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       '200':
 *         description: Successful operation, returns updated project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       '400':
 *         description: Bad request, missing or invalid parameters
 *       '404':
 *         description: Project not found in the database
 *       '500':
 *         description: Internal server error
 */
router.put("/:productId", (req: Request, res: Response) => {
  const productId = req.params.productId;
  const updatedProject = req.body;

  // Validate that all required fields are defined in the updated object
  if (!validProject(updatedProject)) {
    return res
      .status(400)
      .json({ message: "All required fields must be defined." });
  }

  updatedProject.startDate = updatedProject.startDate.replace(/-/g, "/")

  // Find the project with the given ID and update its fields
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].productId === productId) {
      projects[i] = { ...projects[i], ...updatedProject };

      //update date format

      // Update the file with the updated project
      updateJSONFile(dataFileLocation, projects);
      res.json(projects[i]);
      return;
    }
  }
  // If the project with the given ID was not found, return a 404 error
  res.status(404).json({ message: `Project with ID ${productId} not found.` });
});

//helper function to validate a project object is valid
function validProject(project: Project): boolean {
  if (
    !project.productName ||
    !project.productOwnerName ||
    !project.developers ||
    !project.developers.length ||
    !project.scrumMasterName ||
    !project.startDate ||
    !project.methodology
  )
    return false;
  return true;
}

export default router;
