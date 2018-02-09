import { helper } from '@ember/component/helper';

export function tryPerform(params) {
  const [task, ...args] = params || [];

  return async function(...runtime) {
    const parameters = args.concat(runtime);

    try {
      task.perform(...parameters);
    } catch (error) {
      return error;
    }

    return null;
  };
}

export default helper(tryPerform);
