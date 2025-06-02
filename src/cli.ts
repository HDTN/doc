import inquirer from 'inquirer';
import { createService,  } from './utils/prompts';
import { updateDocsJson } from './utils/docsJsonManager';

async function main() {
  console.log('Bem-vindo ao ByFive CLI!');

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: [
        { name: 'Criar nova documentação de serviço', value: 'createService' },
        { name: 'Gerenciar endpoints de um serviço existente', value: 'manageEndpoints' },
        { name: 'Sair', value: 'exit' }
      ]
    }
  ]);

  if (action === 'createService') {
    await createService();
  } else {
    console.log('Até mais!');
  }

  // Atualiza o docs.json após qualquer ação
  await updateDocsJson();
}

main().catch((err) => {
  console.error('Erro:', err);
});