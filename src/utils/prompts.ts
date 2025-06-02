import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { createFile, fileExists } from './fileManager';

// Função para obter o caminho correto dos templates
function getTemplatesPath(): string {
  const devPath = path.resolve(__dirname, '../../src/templates'); // Caminho no ambiente de desenvolvimento
  const distPath = path.resolve(__dirname, '../templates'); // Caminho no ambiente compilado

  // Verifica qual caminho existe
  return fs.existsSync(devPath) ? devPath : distPath;
}

const templatesPath = getTemplatesPath();

export async function createService() {
  const { serviceName } = await inquirer.prompt([
    { type: 'input', name: 'serviceName', message: 'Digite o nome do serviço:' }
  ]);

  const servicePath = path.join(process.cwd(), 'api-reference', serviceName);
  const openApiPath = path.join(servicePath, 'openapi.json');

  if (await fileExists(openApiPath)) {
    console.log('O serviço já existe.');
    return;
  }

  const openApiTemplate = await fs.readFile(path.join(templatesPath, 'openapi.json'), 'utf8');
  await createFile(openApiPath, openApiTemplate.replace('{{SERVICE_NAME}}', serviceName));

  console.log(`Serviço "${serviceName}" criado com sucesso!`);
}