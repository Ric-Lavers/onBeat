# onBeat

Delay functions using promises to trigger on a beat.

## set up

```bash
  npm install onbeat
```

```js
  import Onbeat from 'onbeat'
  const onBeat = new Onbeat(140, 8, 4)
```

## usage

```js
  const getdata = async() => {
    const data = await fetchSomeData()
    onBeat.asyncStep(
      4,
      this.setState({ data: data })
    )
  }
```