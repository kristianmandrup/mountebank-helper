### Swagger

See [swagger-bank](https://tzinov15.github.io/swagger-bank/)

Behind the scenes, it creates responses in the form expected by `mountebank-helper`

```js
function constructCompleteResponse (options) {
  const finalResponse = {
    'uri': options.uri,
    'verb': options.method,
    'res': {
      'statusCode': options.statusCode,
      'responseHeaders': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      'responseBody': JSON.stringify(options.populatedTemplate)
    }
  };

  return finalResponse;
}
```

It will generate response data that match the [Swagger schema definitions](https://swagger.io/specification/) in the `yaml` file.

The `area_id` is a required string in `uuid` format

```yaml
"/areas/{area_id}":
  get:
    description: 'Retrieves a single area object containing information about that
      area, referenced by area_id'
    parameters:
    - name: area_id
      in: path
      type: string
      format: uuid
      required: true
      description: the unique uuid that identifies this area
```

The entire `body` of the `post` must match the `#/definitions/area` schema

```yaml
    post:
      description: This areas endpoint supports the creation of new areas by supplying all the required information of the area in the body
      summary: Add a new area to the hiking guide
      parameters:
      - name: body
        description: The area object that is to be added to the hiking guide
        in: body
        required: true
        schema:
          "$ref": "#/definitions/area"
```

The schema `definitions` section (referenced via `$ref`)

```yaml
definitions:
  area:
    type: object
    required:
    - area_id
    - name
    properties:
      area_id:
        type: string
        format: uuid
        description: The unique identifier that can be used to reference this entity
      name:
        type: string
        description: The human-understandable name used to identify this entity
```


## Sample Swagger file

The following is an extract of the `demoApi.yaml` file of SwaggerBank `/demo` project

```yaml
swagger: '2.0'
info:
  title: Hiking Guide
  description: Get the best out of your hiking guides
  version: 1.0.0
  contact:
    name: Alex Tzinov,
    url: http://www.hiking-guides.com,
    email: some_email@gmail.com
host: api.hiking-guides.com
schemes:
- https
basePath: "/v1"
produces:
- application/json
```

After `produces` you need the following main sections:

- `responses` (types of responses, similar to class/collection or table schemas)
- `paths` (which paths and HTTP methods to match on)
- `definitions` (schema definitions)

The `responses` section

```yaml
responses:
  Area:
    description: An area object
    schema:
      type: object
      "$ref": "#/definitions/area"
    examples:
      application/json:
        area_id: f2552036-3ef9-11e6-beb8-9e71128cae77
        name: some_random_area_name
        tag: radar
        description: some random string for area description
        trails:
        - trail_id: 590481d2-3efa-11e6-beb8-9e71128cae77
          name: some_random_trail_name
          description: some random string for trail description
          distance: 134
          rating: 1
```

The `paths` section

```yaml
paths:
  "/areas":
    get:
      description: This areas endpoint returns information about all of the areas available
      summary: Get all of the areas in the hiking guide
      tags:
      - areas
      responses:
        '200':
          "$ref": "#/responses/AreaArray"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
    post:
      description: This areas endpoint supports the creation of new areas by supplying all the required information of the area in the body
      summary: Add a new area to the hiking guide
      parameters:
      - name: body
        description: The area object that is to be added to the hiking guide
        in: body
        required: true
        schema:
          "$ref": "#/definitions/area"
      tags:
      - areas
      responses:
        '201':
          "$ref": "#/responses/Area"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
  "/areas/{area_id}":
    get:
      description: 'Retrieves a single area object containing information about that
        area, referenced by area_id'
      parameters:
      - name: area_id
        in: path
        type: string
        format: uuid
        required: true
        description: the unique uuid that identifies this area
      summary: Get an area by area ID
      tags:
      - areas
      responses:
        '200':
          "$ref": "#/responses/Area"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
```

The schema `definitions` section

```yaml
definitions:
  area:
    type: object
    required:
    - area_id
    - name
    properties:
      area_id:
        type: string
        format: uuid
        description: The unique identifier that can be used to reference this entity
      name:
        type: string
        description: The human-understandable name used to identify this entity
```

And so on...
