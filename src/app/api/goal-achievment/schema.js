import { z } from "zod";

export const projectSchema = z.object ({ //Create the Schema that we want the ai to return the answer
    project: z.object({
        name: z.string(),
        tasks: z.array(
                    z.object({
                        task: z.string(),
                        hours: z.string(),
                        details: z.string().optional(),
                    })
                ),
        conclusion: z.string(),
    })
})