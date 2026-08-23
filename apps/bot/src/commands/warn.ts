import { subcommandToCommand } from "@/lib/commands";

import warnCommand from "@/commands/mod/warn";

/** 
 * Short command of /mod warn 
 * @see {@link warnCommand}
 */
export default subcommandToCommand(warnCommand);
