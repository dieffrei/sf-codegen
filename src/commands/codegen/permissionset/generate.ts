/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import {flags, SfdxCommand} from '@salesforce/command';
import {Messages} from '@salesforce/core';
import {AnyJson} from '@salesforce/ts-types';
import {ComponentSet, MetadataComponent} from "@salesforce/source-deploy-retrieve";
const pug = require('pug');
const xmlFormatter = require('xml-formatter');

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sf-codegen', 'generate');

interface PermissionSetAttributes {
  label: string,
  name: string
  description: string
}

export default class Generate extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  protected static flagsConfig = {
    path: flags.string({
      char: 'p',
      description: 'Source path',
    }),
    name: flags.string({
      char: 'n',
      description: 'Api Name',
    }),
    label: flags.string({
      char: 'l',
      description: 'Label',
    }),
    description: flags.string({
      char: 'd',
      description: 'Description',
    }),
    force: flags.boolean({
      char: 'f',
      description: messages.getMessage('forceFlagDescription'),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = false;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    let componentSet = ComponentSet.fromSource({
      fsPaths: [this.flags.path],
    });

    const permissionsetAttributes: PermissionSetAttributes = {
      description: this.flags.description,
      name: this.flags.name,
      label: this.flags.label
    }

    await this.generateFiles(permissionsetAttributes, componentSet)
    return {};
  }

  public async generateFiles(attributes: PermissionSetAttributes, componentSet: ComponentSet) {
    const templateFunction = pug.compileFile('./src/templates/permissionset.pug');
    this.ux.log(xmlFormatter.default(templateFunction({
      attributes: attributes,
      fields: componentSet.filter((element: MetadataComponent) => element.type.name == 'CustomField').toArray(),
      objects: componentSet.filter((element: MetadataComponent) => element.type.name == 'CustomObject').toArray()
    })));
  }
}
