## About

Multi model chat LLM is the project where we are using multiple models to generate the output of the same question and then again using an evaluator LLM to pick the best generated response out of all.

Then the best response is served to the user.

## Components

I’m using some of the free models by Nvidia and one from Gemini.

free models from Nvidia,

- nvidia/**nemotron-3-ultra-550b-a55b**\*\*
- mistralai/**mistral-small-4-119b-2603**
- microsoft/**phi-4-mini-instruct**

Gemini model as Evaluator LLM

- Gemini/**flash-3.5**

## Working

Main prompt is being passed as input to individual LLM model and their responses are stored inside local Database.

Responses stored inside local DB are provided to evaluator LLM and it returns the best one after picking.

Current workflow is taking extra time because we are not handling each asynchronous model call simultaneously instead, we are making request to individual LLM one at a time, waiting for it to complete it’s response and store the response in DB.

# Current Problem

Current workflow is time consuming and usual processing time is above 30 seconds.
