import { AbstractTask } from 'alliage-builder/tasks';
import { ShellTask } from 'alliage-builder/tasks/shell-task';
import { EventManager } from 'alliage-lifecycle/event-manager';

import { getBinaryPath } from '../../helpers';
import { BeforeRunEvent, AfterRunEvent } from './events';

export interface Params {
  projectPath: string;
}

export class TypeScriptTask extends AbstractTask {
  private eventManager: EventManager;

  constructor(eventManager: EventManager) {
    super();
    this.eventManager = eventManager;
  }

  getName() {
    return 'typescript';
  }

  getParamsSchema() {
    return {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
        },
      },
    };
  }

  async run({ projectPath }: Params) {
    const tscPath = await getBinaryPath('tsc');
    const beforeRunEvent = new BeforeRunEvent(
      tscPath,
      projectPath,
      new ShellTask(this.eventManager),
      `${tscPath} -p ${projectPath}`,
    );

    this.eventManager.emit(beforeRunEvent.getType(), beforeRunEvent);
    const shellTask = beforeRunEvent.getShellTask();
    const cmd = beforeRunEvent.getCommand();

    await shellTask.run({ cmd });

    this.eventManager.emit(...AfterRunEvent.getParams(tscPath, projectPath, shellTask, cmd));
  }
}
