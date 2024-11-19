#!/usr/bin/env node

const fs = require('fs');

function replaceTokens(str, variables) {
    return str.replace(/{{([\w\d]+)}}/g, (_, token) => {
        if (token in variables) {
            return `(${variables[token]})`;
        } else {
            throw new Error(`Undefined variable: {{${token}}}`);
        }
    });
}

function processTemplate(inputFile, outputFile) {
    if (inputFile === outputFile) {
        throw new Error("Input and output filenames must be different.");
    }
    if (!fs.existsSync(inputFile)) {
        throw new Error(`File not found: ${inputFile}`);
    }

    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n');

    const variables = {};
    const processedLines = [];
    let pushReady = false;

    for (const line of lines) {
        const match = line.match(/#\s*([\w\d]+)=(.+)/);
        if (match) {
            // console.log(`var: ${line}`)
            const [, key, rawValue] = match;
            const processedValue = replaceTokens(rawValue, variables);
            variables[key.trim()] = processedValue.trim();
        } else {
            // console.log(`apl: ${line}`)
            const processedLine = replaceTokens(line, variables);
            if (processedLine.trim() || pushReady) {
                processedLines.push(processedLine);
                if (processedLine.trim()) {
                    pushReady = true;
                }
            }
        }
    }

    fs.writeFileSync(outputFile, processedLines.join('\n'), 'utf-8');
    console.log(`File processed and saved to: ${outputFile}`);
}

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Usage: node template.js <inputFile> <outputFile>");
    process.exit(1);
}

const [inputFile, outputFile] = args;
try {
    processTemplate(inputFile, outputFile);
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}