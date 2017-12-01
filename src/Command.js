class Command {
  constructor(name, description, parent) {
    let aliases

    if (Array.isArray(name)) {
      aliases = name
      name = aliases.shift()
    } else if (typeof name === 'string') {
      aliases = name.split(', ')
      name = aliases.shift()
    }

    if (!name || typeof name !== 'string') {
      throw new Error(
        'The first argument of the Command constructor must be either a non-empty string or an array'
      )
    }

    this.config = {
      name,
      id: parent ? `${parent.config.id}.${name}` : name,
      commands: [],
      options: [],
    }

    this.parent = parent
    this.commands = []
    this.options = []
    this.inheritableSettings = []
    this.inheritableOptions = []

    if (!parent) {
      let { inheritableSettings, inheritableOptions } = this.constructor

      if (inheritableSettings && inheritableSettings.length) {
        this.inheritableSettings = inheritableSettings.slice()
      }

      if (inheritableOptions && inheritableOptions.length) {
        this.inheritableOptions = inheritableOptions.slice()
      }
    }

    if (aliases.length) {
      this.aliases(...aliases)
    }

    if (description) {
      this.description(description)
    }
  }

  aliases(...aliases) {
    this.config.aliases = aliases
    return this
  }

  // TODO: rename (there MUST be a better name)
  makeSettingsInheritable(...settings) {
    this.inheritableSettings.push(...settings)
    return this
  }

  restrict(value) {
    this.config.restrictCommands = value
    this.config.restrictOptions = value
    return this
  }

  command(name, description) {
    let command = new this.constructor(name, description, this)
    this.commands.push(command)
    this.config.commands.push(command.config.id)
    return command
  }

  option(name, description) {
    let option = new this.constructor.Option(name, description, this)
    this.options.push(option)
    this.config.options.push(option.config.id)
    return option
  }

  default() {
    if (!this.parent) {
      throw new Error(
        'Don\'t use default() on the root command. The fluent API supports ' +
        'only one root command, and it is marked as default automatically'
      )
    }

    this.parent.config.defaultCommand = this.config.name
    return this
  }

  end() {
    return this.parent
  }
}

module.exports = Command
