import { ILogger } from '../logger'
import { IRunEnvironment } from './types'
import { ConsoleLogger } from './console_logger'

type EnvironmentWithLogger = Required<IRunEnvironment> & { logger: ILogger }

export function mergeEnvironment(
  provided: IRunEnvironment
): EnvironmentWithLogger {
  const fullEnvironment = Object.assign(
    {},
    {
      cwd: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
      debug: false,
    },
    provided
  )
  return {
    ...fullEnvironment,
    logger: new ConsoleLogger(fullEnvironment.stderr, fullEnvironment.debug),
  }
}
