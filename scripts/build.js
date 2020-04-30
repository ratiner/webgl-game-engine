const fs = require('fs');
const pkg = require('../package.json');

const copyFileSync = (source, dest) => {
    const content = fs.readFileSync(source, 'utf-8');
    fs.writeFileSync(dest, content);
};

delete pkg.private;
delete pkg.scripts;
delete pkg.devDependencies;

fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

copyFileSync('README.md', 'dist/README.md');
copyFileSync('LICENSE', 'dist/LICENSE');

const modules = fs
    .readdirSync('src', { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .forEach((moduleName) => {
        const filePkg = {
            name: `${pkg.name}/${moduleName}`,
            main: `../cjs/${moduleName}/index.js`,
            module: `../esm/${moduleName}/index.js`,
        };

        if (!fs.existsSync(`dist/${moduleName}`)) {
            fs.mkdirSync(`dist/${moduleName}`);
        }

        fs.writeFileSync(`dist/${moduleName}/package.json`, JSON.stringify(filePkg, null, 2));
    });
