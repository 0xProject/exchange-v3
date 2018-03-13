import { postpublishUtils } from '@0xproject/monorepo-scripts';
import { execAsync } from 'async-child-process';
import * as _ from 'lodash';

import * as tsConfig from '../tsconfig.json';

const cwd = __dirname + '/..';
const S3BucketPath = 's3://staging-connect-docs-jsons/';
// Include any external packages that are part of the @0xproject/connect public interface
// to this array so that TypeDoc picks it up and adds it to the Docs JSON
const fileIncludes = [...(tsConfig as any).include];
const fileIncludesAdjusted = postpublishUtils.adjustFileIncludePaths(fileIncludes, __dirname);
const projectFiles = fileIncludesAdjusted.join(' ');
const jsonFilePath = `${__dirname}/../${postpublishUtils.generatedDocsDirectoryName}/index.json`;
const version = process.env.DOCS_VERSION;

(async () => {
    const result = await execAsync(`JSON_FILE_PATH=${jsonFilePath} PROJECT_FILES="${projectFiles}" yarn docs:json`, {
        cwd,
    });
    if (!_.isEmpty(result.stderr)) {
        throw new Error(result.stderr);
    }
    const fileName = `v${version}.json`;
    const s3Url = S3BucketPath + fileName;
    return execAsync(`S3_URL=${s3Url} yarn upload_docs_json`, {
        cwd,
    });
})().catch(console.error);
