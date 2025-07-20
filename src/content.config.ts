import {defineCollection} from "astro:content"
import fslib from "fs/promises"
import pathlib from "path"

export interface Project {
    id: string
    readme: string
    files: {path: string; data: string}[]
}

const projects = defineCollection({
    loader: async () => {
        const projects: Project[] = []
        for (const directory of await fslib.readdir("projects")) {
            await Bun.$`goboscript build -i projects/${directory}`
            const files = await Promise.all(
                (
                    await Array.fromAsync(
                        fslib.glob(pathlib.join("projects", directory, "**", "*.gs"))
                    )
                ).map(async (file) => ({
                    path: pathlib.relative(pathlib.join("projects", directory), file),
                    data: await fslib
                        .readFile(file, "utf-8")
                        .then((content) => content.toString()),
                }))
            )
            files.sort((a, b) => a.path.localeCompare(b.path))
            const readme = await fslib
                .readFile(pathlib.join("projects", directory, "README.md"), "utf-8")
                .then((content) => content.toString())
            projects.push({id: directory, readme, files})
        }
        return projects
    },
})

export const collections = {projects}
