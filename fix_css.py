import os

files = ['static/css/dashboard.css', 'static/css/index.css', 'static/css/tester.css']
for f in files:
    if os.path.exists(f):
        with open(f, 'r') as fp:
            c = fp.read()
        
        c = c.replace('--surfaceace2', '--surface2')
        c = c.replace('--surfaceace', '--surface')
        c = c.replace('--accentent', '--accent')
        c = c.replace('var(--accent-g)', 'var(--accent-glow)')
        c = c.replace('var(--accent-d)', 'var(--accent-dim)')
        c = c.replace('var(--bd)', 'var(--blue-dim)')
        c = c.replace('var(--gd)', 'var(--green-dim)')
        c = c.replace('var(--ad)', 'var(--amber-dim)')
        c = c.replace('var(--pd)', 'var(--purple-dim)')
        c = c.replace('var(--rd)', 'var(--rose-dim)')
        c = c.replace('var(--td)', 'var(--teal-dim)')
        c = c.replace('var(--id)', 'var(--indigo-dim)')
        
        with open(f, 'w') as fp:
            fp.write(c)
print("Fixed CSS files.")
