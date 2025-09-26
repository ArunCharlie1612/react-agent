import { ChatGroq } from "@langchain/groq";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { MemorySaver } from "@langchain/langgraph";
import 'dotenv/config';

//Memory saver to memorize the chat history
const checkpointer = new MemorySaver();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

//We are using a tavilysearch tool to fetch real time information from the web
const tool = new TavilySearch({ maxResults: 3, topic: "general", apiKey: TAVILY_API_KEY });

//Initialise the tool node
const tools = [tool];
const toolNode = new ToolNode(tools);

//Need to Implement the Frontend Tasks:

//Backend Tasks : 
//Create a node function
//Build the Graph
//Compile and Invoke the Agent


//Initialize the LLM Model
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 3,
  apiKey : GROQ_API_KEY
}).bindTools(tools)

//Call the LLM Model
async function callModel(state) {
  //Call the LLM Model
  console.log("Calling LLM Model...");
  const response = await llm.invoke(state.messages);
  return { messages: [response] }
}

//Decide whether to call a tool or end the workflow
function shouldContinue(state) {
  //Write a condition that whether we need to call a tool or end the workflow
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
}


//Build the workflow
const workFlow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

//compile the workflow
const app = workFlow.compile({ checkpointer });

//Interactive AI Agent - Main Function
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  while (true) {
    const userInput = await rl.question("You : ");
    if (userInput === "/end") {
      break;
    }
    //Invoke the workflow / graph
    const finalState = await app.invoke({
      messages: [{ role: "user", content: userInput }]
    }, { configurable:{ thread_id: "1" } });

    const lastMessage = finalState.messages[finalState.messages.length - 1];
    console.log("AI :", lastMessage.content);
  }
  //Only close the readline interface when the user wants to end the chat
  rl.close();
}


//Run the main function
main()








































































// import { serve } from "bun";
// import index from "./index.html";

// const server = serve({
//   routes: {
//     // Serve index.html for all unmatched routes.
//     "/*": index,

//     "/api/hello": {
//       async GET(req) {
//         return Response.json({
//           message: "Hello, world!",
//           method: "GET",
//         });
//       },
//       async PUT(req) {
//         return Response.json({
//           message: "Hello, world!",
//           method: "PUT",
//         });
//       },
//     },

//     "/api/hello/:name": async req => {
//       const name = req.params.name;
//       return Response.json({
//         message: `Hello, ${name}!`,
//       });
//     },
//   },

//   development: process.env.NODE_ENV !== "production" && {
//     // Enable browser hot reloading in development
//     hmr: true,

//     // Echo console logs from the browser to the server
//     console: true,
//   },
// });

// console.log(`🚀 Server running at ${server.url}`);
