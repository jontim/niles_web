// Assuming you're using modules, the import will go at the top of the file
import { createBot } from '../legacy/api.js';
import { AuthModule } from '../legacy/auth.js'; 
import { APIModule } from '../legacy/api.js';
// ui.js - UI Animations Module
const UIModule = (() => {
    const card = document.querySelector('.card');
    let lastButtonClicked = null;
    
    const init = () => {
        attachButtonListeners();
    };
  
    const attachButtonListeners = () => {
        const buttons = [
            document.getElementById('coachingButton'),
            document.getElementById('questionButton'),
            document.getElementById('practiceButton')
        ];

        buttons.forEach(button => {
            button.addEventListener('click', buttonClickHandler);
        });
    };
  
    const buttonClickHandler = (event) => {
        const currentButton = event.target;
        // ... (other UI interaction code)

        let botName;
        let assistantInstructions;
    
        // Determine the botName and assistantInstructions
        switch (currentButton.id) {
            case 'coachingButton':
                botName = 'coachbot';
                assistantInstructions = 'coachbot.txt';
                break;
            case 'questionButton':
                botName = 'infobot';
                assistantInstructions = 'infobot.txt';
                break;
            case 'practiceButton':
                botName = 'scenariobot';
                assistantInstructions = 'scenariobot.txt';
                break;
            default:
                console.log('Invalid bot');
                return;
        }
        createBot(botName, assistantInstructions);
        
        const botInfo = {
            botName: botName,
            assistantInstructions: assistantInstructions,
            fileIds: ['file-sZ5Ia3ePaATq7CqbpzMDZwsL','file-ERVmhxquGOsqTJtUapQcahcb','file-fw32ED0uvdHP7GgIxRJ8ls46','file-BbGxkbeFa9pyW8OgmH9mDO43','file-t5unX2xHB67eTqtvmeFbZe28','file-1IFnTPcG2dQpW4qmjHDZgMkk','file-QKB8UH6rOm4td7KDhZwifVaD','file-8OaxLinFsLyEqGUywALAlOAP','file-PFDryUNSdtqOIcjFIlHq30Lp','file-19G2AQ7tkPGpCpQg5rVDzIZg','file-PYEuzGMjnylHMmtKA0kZPnH4','file-J4eKdSH3Gvbw2y0m6ZbUrVxe','file-29HcVyG0VGnCqP5S3ZP871OD'] 
        };
        
    };
  
    return {
        init,
        // Expose other public methods if necessary...
    };
})();

// Assuming you're using modules and this script is a module, you'd need to initialize it after defining it
document.addEventListener('DOMContentLoaded', () => {
    UIModule.init();
});